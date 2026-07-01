/* ============================================
   ChinaBuyHub — Text-based Gender Classifier
   Uses Groq text model (fast, cheap, no rate limits)
   Classifies by product name + description
   ============================================ */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcFile = resolve(root, 'products.js');
const logFile = resolve(root, 'scripts', 'ai-gender-text-log.json');

const aiConfig = readFileSync(resolve(root, 'ai-config.php'), 'utf-8');
const keyMatch = aiConfig.match(/define\('GROQ_API_KEY',\s*'([^']+)'\)/);
if (!keyMatch) { console.error('No GROQ_API_KEY'); process.exit(1); }
const GROQ_API_KEY = keyMatch[1];

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const BATCH_SIZE = 20;
const DELAY_MS = 8000;

console.log('Loading products...');
const raw = readFileSync(srcFile, 'utf-8');
const match = raw.match(/const products = (\[[\s\S]*\]);?/);
const products = JSON.parse(match[1]);

const log = existsSync(logFile) ? JSON.parse(readFileSync(logFile, 'utf-8')) : { processed: [], stats: {} };
const aiProcessed = log.processed || [];

const toClassify = products.filter((p, i) => {
    if (p.category !== 'SNEAKERS' && p.category !== 'HOODIES' && p.category !== 'T-SHIRTS' && p.category !== 'JACKETS' && p.category !== 'PANTS' && p.category !== 'SHORTS') return false;
    if (p.gender && p.gender !== 'unisex') return false;
    if (aiProcessed.includes(p.id)) return false;
    p._idx = i;
    return true;
});

console.log(`${products.length} total, ${toClassify.length} to classify (${aiProcessed.length} done)`);

if (toClassify.length === 0) { console.log('Done!'); process.exit(0); }

const totalBatches = Math.ceil(toClassify.length / BATCH_SIZE);
let processedInRun = [];
let stats = { men: 0, women: 0, unisex: 0 };

async function classifyBatch(batch) {
    const lines = batch.map((p, i) => `${i + 1}. [${p.category}] ${p.name.substring(0, 80)}`).join('\n');

    const prompt = `Classify each product by gender. Return ONLY a JSON array. Use product name and category to decide.

Women signals: pink, pastel, purple, lavender, blush, rose, platform, wedge heel, ballet, womens, wmns, wm, female, lady, girl, crop, slim fit, skinny, petite, feminine style, small sizes
Men signals: men, mens, male, big sizes, boxy fit, masculine, homme
Unisex: neutral, standard, regular fit, not clearly gendered, unisex label

Products:
${lines}

Return ONLY: [{"index":1,"gender":"women"},{"index":2,"gender":"men"},...]`;

    const resp = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 1000 })
    });

    if (!resp.ok) throw new Error(`API ${resp.status}: ${(await resp.text()).substring(0, 200)}`);

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jm = content.match(/\[[\s\S]*\]/);
    if (!jm) throw new Error('No JSON: ' + content.substring(0, 150));
    return JSON.parse(jm[0]);
}

async function main() {
    for (let b = 0; b < totalBatches; b++) {
        const start = b * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, toClassify.length);
        const batch = toClassify.slice(start, end);

        process.stdout.write(`\rBatch ${b + 1}/${totalBatches} (${batch.length} items)...`);

        try {
            const results = await classifyBatch(batch);

            for (const r of results) {
                const prod = batch[r.index - 1]; // 1-indexed in prompt
                if (!prod) continue;
                const idx = prod._idx;
                const gender = (r.gender || 'unisex').toLowerCase();
                if (['men', 'women', 'unisex'].includes(gender)) {
                    products[idx].gender = gender;
                    stats[gender] = (stats[gender] || 0) + 1;
                }
            }

            processedInRun.push(...batch.map(p => p.id));

            writeFileSync(logFile, JSON.stringify({ processed: [...aiProcessed, ...processedInRun], stats, lastBatch: b + 1, totalBatches, lastRun: new Date().toISOString() }, null, 2));
            writeFileSync(srcFile, 'const products = ' + JSON.stringify(products) + ';');

        } catch (err) {
            console.error(`\nBatch ${b + 1} failed:`, err.message);
            break;
        }

        if (b < totalBatches - 1) await new Promise(r => setTimeout(r, DELAY_MS));
    }

    console.log(`\n\nDone! ${processedInRun.length} classified`);
    console.log(`Men: ${stats.men || 0}, Women: ${stats.women || 0}, Unisex: ${stats.unisex || 0}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
