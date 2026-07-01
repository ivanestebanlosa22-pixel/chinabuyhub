/* ============================================
   ChinaBuyHub — AI Description Generator
   ============================================
   Generates unique, SEO-optimized product 
   descriptions using Groq text model.
   Replaces generic "Quality fabric..." texts.
   Resumable, saves after each batch.
   ============================================ */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcFile = resolve(root, 'products.js');
const logFile = resolve(root, 'scripts', 'ai-desc-log.json');

const aiConfig = readFileSync(resolve(root, 'ai-config.php'), 'utf-8');
const keyMatch = aiConfig.match(/define\('GROQ_API_KEY',\s*'([^']+)'\)/);
if (!keyMatch) { console.error('No GROQ_API_KEY'); process.exit(1); }
const GROQ_API_KEY = keyMatch[1];

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const BATCH_SIZE = 15;
const DELAY_MS = 8000;

console.log('Loading products...');
const raw = readFileSync(srcFile, 'utf-8');
const match = raw.match(/const products = (\[[\s\S]*\]);?/);
const products = JSON.parse(match[1]);

const log = existsSync(logFile) ? JSON.parse(readFileSync(logFile, 'utf-8')) : { processed: [], generated: 0, lastRun: null };
const aiProcessed = log.processed || [];

// Products that need better descriptions (generic/boring ones)
const genericPhrases = [
  'quality fabric', 'solid construction', 'fast shipping',
  'good materials', 'practical design', 'qc approved',
  'premium batch', 'accurate details', 'community tested',
  'reviewed by buyers', 'heavyweight cotton', 'brushed interior',
];

function needsBetterDesc(p) {
  if (aiProcessed.includes(p.id)) return false;
  const desc = (p.description || '').toLowerCase();
  if (desc.length < 40) return true; // very short
  for (const phrase of genericPhrases) {
    if (desc.includes(phrase)) return true;
  }
  return false;
}

const toProcess = products.filter((p, i) => {
  if (!needsBetterDesc(p)) return false;
  p._idx = i;
  return true;
});

console.log(`${products.length} total, ${toProcess.length} need better descriptions (${aiProcessed.length} done)`);

if (toProcess.length === 0) { console.log('All descriptions are good!'); process.exit(0); }

const totalBatches = Math.ceil(toProcess.length / BATCH_SIZE);
let processedInRun = [];

async function generateDescriptions(batch) {
  const productsList = batch.map((p, i) => {
    const name = p.name.substring(0, 80);
    const cat = p.category;
    const brand = p.brand || 'Unknown';
    const price = p.price;
    const gender = p.gender || 'unisex';
    const currentDesc = (p.description || '').substring(0, 100);
    return `${i + 1}. [${cat}] ${name} | Brand: ${brand} | Price: $${price} | Gender: ${gender} | Current: "${currentDesc}"`;
  }).join('\n');

  const prompt = `You are an SEO copywriter for ChinaBuyHub, a site that helps people buy replica/fashion products from Chinese agents (Kakobuy, USFans, Litbuy).

Write a unique, SEO-optimized product description for EACH of these ${batch.length} products. Rules:
- 2-3 sentences (40-80 words) per product
- Include: what it is, material/quality hints, style/fit notes, why it's a good buy
- Use keywords naturally: the brand, product type, "replica", "high quality", "affordable", "buy online"
- Make each description UNIQUE — no templates, no repetition
- Write in English, conversational but professional tone
- NEVER mention specific agents (Kakoboy/USFans/Litbuy) in the description
- NEVER use phrases like "Quality fabric, solid construction. Fast shipping" or "Good materials, practical design"

Products to describe:
${productsList}

Return ONLY a JSON array with the new descriptions:
[{"index":1,"description":"..."},{"index":2,"description":"..."},...]
No other text. Only the JSON array.`;

  const resp = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 2000 })
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API ${resp.status}: ${err.substring(0, 250)}`);
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || '';
  const jm = content.match(/\[[\s\S]*\]/);
  if (!jm) throw new Error('No JSON: ' + content.substring(0, 200));
  return JSON.parse(jm[0]);
}

async function main() {
  for (let b = 0; b < totalBatches; b++) {
    const start = b * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, toProcess.length);
    const batch = toProcess.slice(start, end);

    process.stdout.write(`\rBatch ${b + 1}/${totalBatches} (${batch.length} products)...`);

    try {
      const results = await generateDescriptions(batch);

      for (const r of results) {
        const prod = batch[r.index - 1];
        if (!prod || !r.description) continue;
        const idx = prod._idx;
        const newDesc = r.description.trim();
        if (newDesc.length > 20 && newDesc !== products[idx].description) {
          console.log(`\n  ${prod.id}: ${newDesc.substring(0, 100)}...`);
          products[idx].description = newDesc;
        }
      }

      processedInRun.push(...batch.map(p => p.id));

      const newLog = {
        processed: [...aiProcessed, ...processedInRun],
        generated: (log.generated || 0) + batch.length,
        lastBatch: b + 1,
        totalBatches,
        lastRun: new Date().toISOString()
      };
      writeFileSync(logFile, JSON.stringify(newLog, null, 2));
      writeFileSync(srcFile, 'const products = ' + JSON.stringify(products) + ';');

    } catch (err) {
      console.error(`\nBatch ${b + 1} failed:`, err.message);
      console.log('Saving & exiting. Resume with: node scripts/ai-desc-generator.mjs');
      break;
    }

    if (b < totalBatches - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }

  console.log(`\n\nDone! Generated ${processedInRun.length} descriptions.`);
  console.log(`Total done: ${aiProcessed.length + processedInRun.length}/${toProcess.length + aiProcessed.length}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
