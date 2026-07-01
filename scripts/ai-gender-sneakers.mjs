/* ============================================
   ChinaBuyHub — AI Vision Gender Classifier
   ============================================
   Uses Groq Vision (llama-4-scout) to classify
   sneaker images as men/women/unisex.
   Also validates that products in SNEAKERS
   are actually footwear (not bags, shirts, etc).
   Fully resumable, rate-limit aware.
   ============================================ */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcFile = resolve(root, 'products.js');
const logFile = resolve(root, 'scripts', 'ai-gender-log.json');

const aiConfig = readFileSync(resolve(root, 'ai-config.php'), 'utf-8');
const keyMatch = aiConfig.match(/define\('GROQ_API_KEY',\s*'([^']+)'\)/);
if (!keyMatch) { console.error('No GROQ_API_KEY'); process.exit(1); }
const GROQ_API_KEY = keyMatch[1];

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const BATCH_SIZE = 2;
const DELAY_MS = 35000;

console.log('Loading products...');
console.log('Waiting 60s for rate limit reset...');
await new Promise(r => setTimeout(r, 60000));
const raw = readFileSync(srcFile, 'utf-8');
const match = raw.match(/const products = (\[[\s\S]*\]);?/);
if (!match) { console.error('Parse error'); process.exit(1); }
const products = JSON.parse(match[1]);

const aiProcessed = existsSync(logFile) ? (JSON.parse(readFileSync(logFile, 'utf-8')).processed || []) : [];

// All SNEAKERS with images, not yet processed
const sneakers = products.filter((p, i) => {
    if ((p.category || '') !== 'SNEAKERS') return false;
    if (!p.image || !/^https?:\/\//.test(p.image)) return false;
    if (aiProcessed.includes(p.id)) return false;
    p._idx = i;
    return true;
});

console.log(`${products.length} total, ${sneakers.length} SNEAKERS to classify (${aiProcessed.length} done)`);

if (sneakers.length === 0) { console.log('Done.'); process.exit(0); }

const totalBatches = Math.ceil(sneakers.length / BATCH_SIZE);
let processedInRun = [];
let stats = { men: 0, women: 0, unisex: 0, misclassified: 0 };

async function classifyBatch(batch) {
    const imageMessages = batch.map((p, i) => ({
        type: 'image_url',
        image_url: { url: p.image }
    }));

    const namesList = batch.map((p, i) => `[${i}] ${p.name}`).join('\n');

    const prompt = `Classify these ${batch.length} shoe images:
Return for each: gender ("men"/"women"/"unisex") AND category ("SNEAKERS"/"ACCESSORIES"/"BAGS"/"T-SHIRTS" if image is NOT footwear)
Footwear = sneakers, shoes, boots, sandals, trainers.
If image shows a bag, backpack, shirt, accessory, or anything NOT footwear → category=correct one, gender=unisex.

Products: ${namesList}

Return ONLY JSON: [{"index":0,"gender":"men","category":"SNEAKERS"},...]`;

    // Retry loop
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 60000);

            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...imageMessages] }], temperature: 0.1, max_tokens: 800 }),
                signal: controller.signal
            });
            clearTimeout(tid);

            if (response.status === 429) {
                const body = await response.text();
                const w = body.match(/try again in ([\d.]+)s/);
                const wait = (w ? parseFloat(w[1]) : 15) + 2;
                process.stdout.write(`\rRate limited, waiting ${Math.ceil(wait)}s...`);
                await new Promise(r => setTimeout(r, wait * 1000));
                continue;
            }

            if (!response.ok) {
                const err = await response.text();
                if (err.includes('context deadline') || err.includes('timeout')) {
                    process.stdout.write('\rTimeout, retrying...');
                    await new Promise(r => setTimeout(r, 15000));
                    continue;
                }
                throw new Error(`API ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            const jm = content.match(/\[[\s\S]*\]/);
            if (!jm) throw new Error('No JSON');
            return JSON.parse(jm[0]);
        } catch (e) {
            if (e.name === 'AbortError') {
                process.stdout.write('\rTimeout, retrying...');
                await new Promise(r => setTimeout(r, 15000));
                continue;
            }
            if (attempt === 2) throw e;
            await new Promise(r => setTimeout(r, 10000));
        }
    }
    throw new Error('Max retries');
}

async function main() {
    for (let b = 0; b < totalBatches; b++) {
        const start = b * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, sneakers.length);
        const batch = sneakers.slice(start, end);

        const bn = b + 1;
        const pct = Math.round((b / totalBatches) * 100);
        process.stdout.write(`\rBatch ${bn}/${totalBatches} (${pct}%)`);

        try {
            const results = await classifyBatch(batch);

            for (const r of results) {
                const prod = batch[r.index];
                if (!prod) continue;
                const idx = prod._idx;
                if (idx === undefined) continue;

                const gender = (r.gender || 'unisex').toLowerCase();
                const aiCat = (r.category || 'SNEAKERS').toUpperCase();

                if (['men', 'women', 'unisex'].includes(gender)) {
                    products[idx].gender = gender;
                    stats[gender]++;
                }

                // If AI says it's NOT a sneaker, move it
                if (aiCat !== 'SNEAKERS' && ['T-SHIRTS','HOODIES','JACKETS','PANTS','SHORTS','BAGS','CAPS','ACCESSORIES','ELECTRONICS','WOMAN'].includes(aiCat)) {
                    const oldCat = products[idx].category;
                    products[idx].category = aiCat;
                    products[idx].subcategory = aiCat;
                    stats.misclassified++;
                    console.log(`\n  MOVED ${prod.id}: SNEAKERS→${aiCat} | ${prod.name.substring(0,60)}`);
                }
            }

            processedInRun.push(...batch.map(p => p.id));

            writeFileSync(logFile, JSON.stringify({
                processed: [...aiProcessed, ...processedInRun],
                stats,
                lastBatch: bn,
                totalBatches,
                lastRun: new Date().toISOString()
            }, null, 2));

            writeFileSync(srcFile, 'const products = ' + JSON.stringify(products) + ';');

        } catch (err) {
            console.error(`\nBatch ${bn} failed:`, err.message);
            console.log('Saving & exiting. Resume with: node scripts/ai-gender-sneakers.mjs');
            break;
        }

        if (b < totalBatches - 1) {
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    console.log(`\n\nDone! ${processedInRun.length} classified:`);
    console.log(`  Men: ${stats.men}, Women: ${stats.women}, Unisex: ${stats.unisex}`);
    console.log(`  Misclassified (moved): ${stats.misclassified}`);
    console.log(`Total AI-processed: ${aiProcessed.length + processedInRun.length}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
