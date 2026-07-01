/* ============================================
   ChinaBuyHub — AI Photo-Based Catalog Classifier
   ============================================
   Uses Groq Vision (llama-3.2-90b-vision-preview)
   to classify products by analyzing their PHOTOS.

   Steps:
   1. Scan products with keyword heuristics to find
      likely misclassified items
   2. Send product images to AI Vision
   3. AI determines: category, subcategory, gender, brand
   4. Updates products.js with corrections
   5. Fully resumable — saves progress after each batch

   Categories: SNEAKERS, HOODIES, T-SHIRTS, JACKETS,
              PANTS, SHORTS, BAGS, CAPS, ACCESSORIES,
              ELECTRONICS, WOMAN
   ============================================ */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcFile = resolve(root, 'products.js');
const logFile = resolve(root, 'scripts', 'ai-catalog-cleaner-log.json');

// =====================================================
// CONFIG
// =====================================================
const aiConfig = readFileSync(resolve(root, 'ai-config.php'), 'utf-8');
const keyMatch = aiConfig.match(/define\('GROQ_API_KEY',\s*'([^']+)'\)/);
if (!keyMatch) { console.error('Could not find GROQ_API_KEY in ai-config.php'); process.exit(1); }
const GROQ_API_KEY = keyMatch[1];

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const BATCH_SIZE = 3; // Smaller for reliability
const DELAY_MS = 35000; // 35s to stay under 30K TPM

// =====================================================
// VALID CATEGORIES
// =====================================================
const VALID_CATEGORIES = [
  'SNEAKERS', 'HOODIES', 'T-SHIRTS', 'JACKETS',
  'PANTS', 'SHORTS', 'BAGS', 'CAPS', 'ACCESSORIES',
  'ELECTRONICS', 'WOMAN'
];

// =====================================================
// KEYWORD HEURISTICS — find likely misclassifications
// =====================================================
const CLOTHING_KEYWORDS = {
  'T-SHIRTS': ['t-shirt', 'tee-shirt', 'polo shirt', 'oxford shirt', 'longsleeve', 'long sleeve', 'jersey', 'blouse'],
  HOODIES: ['hoodie', 'hoody', 'hooded', 'pullover hood', 'zip hood', 'sweater', 'knitwear', 'crewneck', 'sweatshirt'],
  JACKETS: ['jacket', 'coat ', 'blazer', 'windbreaker', 'puffer', 'bomber', 'parka', 'down jacket', 'raincoat', 'trench coat'],
  PANTS: ['jeans', 'jogger', 'sweatpant', 'trouser', 'pant ', 'cargo pant', 'track pant'],
  SHORTS: ['short ', 'shorts', 'bermuda', 'trunk'],
  SNEAKERS: ['sneaker', 'shoe', 'trainer', 'air max', 'air force', 'dunk', 'yeezy 350', 'yeezy 500', 'yeezy 700', 'yeezy slide', 'yeezy foam', 'new balance ', 'asics ', 'converse ', 'vans ', 'crocs ', 'boot ', 'boots ', 'heels', 'loafer', 'slide', 'slipper', 'mule', 'clog', 'sandal', 'uggs', 'lacoste shoe'],
  BAGS: ['backpack', 'tote bag', 'tote ', 'duffel', 'briefcase', 'luggage', 'suitcase', 'crossbody', 'shoulder bag', 'clutch', 'handbag'],
  CAPS: ['cap ', 'caps', 'hat ', 'hats', 'beanie', 'bucket hat', 'snapback', 'fitted cap', 'visor'],
};

function quickScan(products) {
  console.log('=== Quick keyword scan for likely misclassifications ===\n');
  const suspects = [];

  for (const p of products) {
    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toUpperCase();

    // Skip WOMAN (small, manual category)
    if (cat === 'WOMAN') continue;

    // Skip products without images
    if (!p.image || !/^https?:\/\//.test(p.image)) continue;

    for (const [targetCat, keywords] of Object.entries(CLOTHING_KEYWORDS)) {
      if (targetCat === cat) continue; // already correctly categorized

      for (const kw of keywords) {
        if (name.includes(kw)) {
          suspects.push({
            id: p.id,
            name: p.name.substring(0, 80),
            currentCat: cat,
            suggestedCat: targetCat,
            image: p.image
          });
          break; // one match is enough
        }
      }
    }
  }

  // Deduplicate by id
  const seen = new Set();
  const unique = suspects.filter(s => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });

  // Group by current category
  const byCat = {};
  for (const s of unique) {
    const key = s.currentCat + ' → ' + s.suggestedCat;
    if (!byCat[key]) byCat[key] = [];
    byCat[key].push(s);
  }

  for (const [key, items] of Object.entries(byCat).sort()) {
    console.log(`  ${key}: ${items.length} products`);
  }
  console.log(`\n  TOTAL suspects: ${unique.length}`);

  return unique;
}

// =====================================================
// AI VISION CLASSIFICATION
// =====================================================
async function classifyBatch(batch) {
  const imageMessages = [];
  const imageIds = [];

  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    imageMessages.push({
      type: 'image_url',
      image_url: { url: p.image }
    });
    imageIds.push(`[IMG${i}] id=${p.id} current_cat=${p.currentCat} name="${p.name}"`);
  }

  const prompt = `Classify these ${batch.length} product images. For each image return:
category (one of: SNEAKERS HOODIES T-SHIRTS JACKETS PANTS SHORTS BAGS CAPS ACCESSORIES ELECTRONICS)
gender (men women unisex)
brand (visible brand name or "Unknown")
confidence (high medium low)

Categories: SNEAKERS=any footwear. HOODIES=sweatshirts,sweaters,hoodies,crewnecks. T-SHIRTS=shirts,tops,polos,jerseys,longsleeves. JACKETS=coats,blazers,vests,puffers,parkas. PANTS=jeans,trousers,joggers. SHORTS=shorts,bermudas. BAGS=backpacks,totes,handbags. CAPS=hats,beanies. ACCESSORIES=socks,belts,jewelry,watches,glasses,phone cases,figurines. ELECTRONICS=gadgets,headphones.

Current info (TRUST THE IMAGE):
${imageIds.join('\n')}

Return ONLY JSON: [{"index":0,"category":"SHORTS","gender":"men","brand":"Nike","confidence":"high"},...]`;

  const messages = [{
    role: 'user',
    content: [{ type: 'text', text: prompt }, ...imageMessages]
  }];

  // Retry up to 3 times with exponential backoff
  let lastError = new Error('Max retries exceeded');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, messages, temperature: 0.1, max_tokens: 800 }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.status === 429) {
        const errBody = await response.text();
        const waitMatch = errBody.match(/try again in ([\d.]+)s/);
        const waitSec = waitMatch ? parseFloat(waitMatch[1]) + 2 : 15;
        console.log(`\n  Rate limited. Waiting ${Math.ceil(waitSec)}s...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        // Retry on timeout/overload
        if (errText.includes('context deadline') || errText.includes('timeout')) {
          lastError = new Error('Groq server timeout');
          console.log(`\n  Groq timeout, waiting 10s...`);
          await new Promise(r => setTimeout(r, 10000));
          continue;
        }
        throw new Error(`API ${response.status}: ${errText.substring(0, 300)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        lastError = new Error('No JSON in response: ' + content.substring(0, 200));
        if (attempt < 2) {
          console.log(`\n  Retry ${attempt + 1}/2: bad response format`);
          await new Promise(r => setTimeout(r, 5000));
        }
        continue;
      }
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') {
        lastError = new Error('Groq request timed out after 45s');
        console.log(`\n  Fetch timeout, waiting 15s...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      if (attempt < 2) {
        console.log(`\n  Retry ${attempt + 1}/2: ${err.message.substring(0, 80)}`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  throw lastError;
}

// =====================================================
// MAIN
// =====================================================
async function main() {
  console.log('Loading products.js...');
  const raw = readFileSync(srcFile, 'utf-8');
  const match = raw.match(/const products = (\[[\s\S]*\]);?/);
  if (!match) { console.error('Parse error'); process.exit(1); }
  const products = JSON.parse(match[1]);
  console.log(`Loaded ${products.length} products`);

  // Quick scan for suspects
  const suspects = quickScan(products);

  if (suspects.length === 0) {
    console.log('No potential misclassifications found.');
    process.exit(0);
  }

  // Check resume state
  const aiProcessed = existsSync(logFile) ? JSON.parse(readFileSync(logFile, 'utf-8')).processed || [] : [];
  const remaining = suspects.filter(s => !aiProcessed.includes(s.id));

  console.log(`Already processed: ${aiProcessed.length}`);
  console.log(`Remaining to classify: ${remaining.length}`);

  if (remaining.length === 0) {
    console.log('All suspects have been processed!');
    process.exit(0);
  }

  // Build product index for fast lookup
  const productIndex = {};
  for (let i = 0; i < products.length; i++) {
    productIndex[products[i].id] = i;
  }

  const stats = { fixed: 0, confirmed: 0, skipped: 0, total: 0 };
  Object.keys(stats).forEach(k => { if (k !== 'total') stats[k] = 0; });

  const totalBatches = Math.ceil(remaining.length / BATCH_SIZE);
  let processedInRun = [];

  for (let b = 0; b < totalBatches; b++) {
    const start = b * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, remaining.length);
    const batch = remaining.slice(start, end);

    const batchNum = b + 1;
    const pct = Math.round((b / totalBatches) * 100);
    process.stdout.write(`\rBatch ${batchNum}/${totalBatches} (${pct}%) — ${batch.length} images...`);

    let batchResults;
    try {
      batchResults = await classifyBatch(batch);
    } catch (batchErr) {
      const errMsg = batchErr.message || '';
      const isImageFetchError = errMsg.includes('403') || errMsg.includes('retrieve media');
      const isTimeout = errMsg.includes('context deadline') || errMsg.includes('timeout');

      if (isTimeout && b < totalBatches - 1) {
        console.log(`\n  Timeout, waiting 15s and retrying...`);
        await new Promise(r => setTimeout(r, 15000));
        b--; // retry this batch
        continue;
      }

      if (isImageFetchError) {
        // One or more images are broken — process individually
        console.log(`\n  Some images blocked, processing individually...`);
        batchResults = [];
        for (let i = 0; i < batch.length; i++) {
          const single = [batch[i]];
          try {
            const singleResults = await classifyBatch(single);
            if (singleResults && singleResults.length > 0) {
              const r = singleResults[0];
              r.index = i; // remap index
              batchResults.push(r);
            }
          } catch (singleErr) {
            console.log(`    Skipping ${batch[i].id}: image unavailable`);
            // Skip this product — mark as processed
            processedInRun.push(batch[i].id);
          }
          // Small delay between individual requests
          if (i < batch.length - 1) await new Promise(r => setTimeout(r, 5000));
        }
      } else {
        console.error(`\nBatch ${batchNum} failed:`, batchErr.message);
        console.log('Saving progress and exiting. Run again to resume.');
        break;
      }
    }

    if (batchResults && batchResults.length > 0) {
      for (const r of batchResults) {
        const suspect = batch[r.index];
        if (!suspect) continue;

        const idx = productIndex[suspect.id];
        if (idx === undefined) continue;

        const aiCat = (r.category || '').toUpperCase();
        const aiGender = (r.gender || '').toLowerCase();
        const aiBrand = (r.brand || '').trim();
        const confidence = (r.confidence || 'medium').toLowerCase();

        // Only apply fixes if AI is confident
        if (confidence === 'high' || confidence === 'medium') {
          if (VALID_CATEGORIES.includes(aiCat) && aiCat !== suspect.currentCat) {
            const oldCat = products[idx].category;
            products[idx].category = aiCat;
            products[idx].subcategory = aiCat;
            stats.fixed++;
            console.log(`\n  FIXED ${suspect.id}: ${oldCat} → ${aiCat} | ${suspect.name.substring(0, 60)}`);
          } else if (aiCat === suspect.currentCat) {
            stats.confirmed++;
          }

          // Update gender if detected
          if (['men', 'women', 'unisex'].includes(aiGender)) {
            products[idx].gender = aiGender;
          }

          // Update brand if AI found one and current is empty/unknown
          if (aiBrand && aiBrand !== 'Unknown' && aiBrand !== 'Other' && aiBrand.length > 1) {
            const currentBrand = (products[idx].brand || '').trim();
            if (!currentBrand || currentBrand === 'Unknown' || currentBrand === 'Other' || currentBrand === '') {
              products[idx].brand = aiBrand;
            }
          }
        } else {
          stats.skipped++;
        }

        stats.total++;
      }
    }

    // Mark batch items as processed
    for (const s of batch) {
      if (!processedInRun.includes(s.id)) processedInRun.push(s.id);
    }

    // Save progress
    const logData = {
      processed: [...aiProcessed, ...processedInRun],
      stats,
      lastBatch: batchNum,
      totalBatches,
      lastRun: new Date().toISOString()
    };
    writeFileSync(logFile, JSON.stringify(logData, null, 2));

    // Save products.js
    const newContent = 'const products = ' + JSON.stringify(products) + ';';
    writeFileSync(srcFile, newContent);

    if (b < totalBatches - 1) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n\n=== AI Catalog Cleaning Complete ===`);
  console.log(`Fixed (category changed): ${stats.fixed}`);
  console.log(`Confirmed (already correct): ${stats.confirmed}`);
  console.log(`Skipped (low confidence): ${stats.skipped}`);
  console.log(`Total processed: ${stats.total}`);
  console.log(`Overall processed: ${aiProcessed.length + processedInRun.length}`);
  console.log('\nproducts.js updated. Check ai-catalog-cleaner-log.json for details.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
