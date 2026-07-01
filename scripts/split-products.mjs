import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dataDir = join(root, 'data');

// Read and parse products.js
const raw = readFileSync(join(root, 'products.js'), 'utf-8');
const jsonStr = raw.replace(/^\uFEFF/, '').replace(/^const products\s*=\s*/, '').replace(/;\s*$/, '');
const products = JSON.parse(jsonStr);

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

// Group by normalized category
const byCategory = {};
for (const p of products) {
  const cat = (p.category || 'OTHER').toUpperCase();
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(p);
}

// Write per-category files
for (const [cat, items] of Object.entries(byCategory)) {
  writeFileSync(
    join(dataDir, `${cat}.json`),
    JSON.stringify(items, null, 2)
  );
  console.log(`  ${cat}: ${items.length} products -> data/${cat}.json`);
}

// Write combined file
writeFileSync(
  join(dataDir, 'all-products.json'),
  JSON.stringify(products, null, 2)
);
console.log(`\nTotal: ${products.length} products -> data/all-products.json`);
console.log(`Categories: ${Object.keys(byCategory).length}`);
