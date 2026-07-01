/* ============================================
   ChinaBuyHub — Catalog Fix & Enhance Script
   ============================================
   1. Move watches from ELECTRONICS → ACCESSORIES
   2. Fix misclassified items (Air Max Plus → SNEAKERS, etc.)
   3. Add `gender` field (men/women/unisex)
   4. Sync subcategory with category
   ============================================ */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcFile = resolve(root, 'products.js');
const backupFile = resolve(root, 'products_backup.js');
const outFile = resolve(root, 'products.js');

console.log('Reading products.js...');
const raw = readFileSync(srcFile, 'utf-8');

// Extract JSON array
const match = raw.match(/const products = (\[[\s\S]*\]);?/);
if (!match) {
    console.error('Could not parse products.js');
    process.exit(1);
}

const products = JSON.parse(match[1]);
console.log(`Loaded ${products.length} products`);

// =====================================================
// STATS BEFORE
// =====================================================
function logStats(label) {
    const cats = {};
    for (const p of products) cats[p.category] = (cats[p.category] || 0) + 1;
    console.log(`\n${label}:`);
    Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

logStats('Categories BEFORE fixes');

// =====================================================
// WATCH BRAND PATTERNS (products to move to ACCESSORIES)
// =====================================================
const watchBrands = [
    'apple watch', 'apple watch ultra',
    'casio', 'rolex', 'omega', 'tissot', 'cartier', 'tag heuer',
    'hublot', 'breitling', 'longines', 'patek philippe', 'audemars piguet',
    'richard mille', 'iwc', 'panerai', 'jaeger-lecoultre', 'blancpain',
    'breguet', 'vacheron constantin', 'piaget', 'chopard', 'franck muller',
    'glashütte', 'a. lange', 'breguet',
    'armani watch', 'burberry watch', 'bvlgari watch', 'calvin klein watch',
    'chanel watch', 'coach watch', 'diesel watch', 'dior watch',
    'gucci watch', 'hermes watch', 'lola rose watch', 'mido watch',
    'movado watch', 'rado watch', 'sevenfriday watch', 'swarovski watch',
    'tiffany watch', 'tudor watch', 'ulysse nardin watch',
    'van cleef watch', 'versace watch', 'vivienne westwood watch',
    'watch box',
];

const hairCareBrands = ['ghd', 'dyson supersonic', 'dyson airwrap'];

// Specific misclassifications to fix
const specificFixes = {
    'R06760': 'SNEAKERS',   // Air Max Plus — it's a Nike sneaker
    'R07359': 'ACCESSORIES', // Armani — perfume/fragrance
    'R08944': 'ACCESSORIES', // OSOS Open Source Smart Pocket — unclear product
    'R08771': 'ACCESSORIES', // Ndenglass Hekkpipe Active — unclear product
};

function isWatch(p) {
    const name = (p.name || '').toLowerCase();
    const category = (p.category || '');
    if (category !== 'ELECTRONICS') return false;
    for (const brand of watchBrands) {
        if (name.includes(brand)) return true;
    }
    return false;
}

function isHairCare(p) {
    const name = (p.name || '').toLowerCase();
    for (const b of hairCareBrands) {
        if (name.includes(b)) return true;
    }
    return false;
}

let watchCount = 0;
let hairCareCount = 0;
let specificFixCount = 0;

for (const p of products) {
    if (isWatch(p)) {
        p.category = 'ACCESSORIES';
        p.subcategory = 'ACCESSORIES';
        watchCount++;
    } else if (isHairCare(p)) {
        p.category = 'ACCESSORIES';
        p.subcategory = 'ACCESSORIES';
        hairCareCount++;
    } else if (specificFixes[p.id]) {
        p.category = specificFixes[p.id];
        p.subcategory = specificFixes[p.id];
        specificFixCount++;
    }
}

console.log(`\nFixed: ${watchCount} watches → ACCESSORIES`);
console.log(`Fixed: ${hairCareCount} hair care → ACCESSORIES`);
console.log(`Fixed: ${specificFixCount} specific misclassifications`);

// =====================================================
// ADD GENDER FIELD
// =====================================================

function detectGender(p) {
    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toUpperCase();

    // Strong women signals
    const womenKeywords = [
        'women\'s', 'womens', 'woman', 'women',
        'mujer', 'dama', 'damy', 'dam ', 'lady',
        'girl ', 'girls', 'female',
        'bellissima',
    ];

    for (const kw of womenKeywords) {
        if (name.includes(kw)) return 'women';
    }

    // Products already in WOMAN category
    if (cat === 'WOMAN') return 'women';

    // Specific items that are clearly women's
    const womenProducts = [
        'sports bra', 'bralette', 'lululemon', 'lululemon skirt',
        'alo bra', 'juicy couture set', 'zara skirt',
        'grace girl earring', 'designer women hair clip',
        'crop top', ' Camo Top', 'women gray zip',
        'women longsleeve', 'women pants', 'women top',
        'knitted dress', 'skirt',
    ];
    for (const kw of womenProducts) {
        if (name.includes(kw.toLowerCase())) return 'women';
    }

    return 'unisex';
}

let womenCount = 0;
for (const p of products) {
    p.gender = detectGender(p);
    if (p.gender === 'women') womenCount++;
}

console.log(`Gender tagged: ${womenCount} women's products`);

// =====================================================
// WRITE OUTPUT
// =====================================================

logStats('Categories AFTER fixes');

// Backup
const backupContent = `// Backup of products.js before catalog fix\n// Saved: ${new Date().toISOString()}\nconst products = `;
writeFileSync(backupFile, backupContent + JSON.stringify(products) + ';');
console.log(`\nBackup saved to products_backup.js`);

// New products.js
const newContent = 'const products = ' + JSON.stringify(products) + ';';
writeFileSync(outFile, newContent);
console.log(`Updated products.js written (${(newContent.length / 1024 / 1024).toFixed(1)} MB)`);
console.log('\nDone! All fixes applied.');
