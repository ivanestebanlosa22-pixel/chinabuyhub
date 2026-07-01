import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load and parse products.js
const productsRaw = readFileSync(join(root, 'products.js'), 'utf-8');
const jsonStr = productsRaw.replace(/^\uFEFF/, '').replace(/^const products\s*=\s*/, '').replace(/;\s*$/, '');
const products = JSON.parse(jsonStr);

// Same logic as getFeaturedProducts() in index.html
function getFeaturedProducts() {
    const now = new Date();
    const periods = Math.floor(now.getTime() / (1000 * 60 * 60 * 12));

    const sneakers = products.filter(p =>
        p.category === "SNEAKERS" && p.image && p.image.indexOf('resources/') !== 0 && p.brand && p.brand !== "Other"
    );
    const clothing = products.filter(p =>
        (p.category === "HOODIES" || p.category === "T-SHIRTS" || p.category === "JACKETS") && p.image && p.image.indexOf('resources/') !== 0
    );
    const accessories = products.filter(p =>
        (p.category === "ACCESSORIES" || p.category === "BAGS" || p.category === "WATCHES" || p.category === "CAPS" || p.category === "HATS") && p.image && p.image.indexOf('resources/') !== 0
    );
    const pants = products.filter(p =>
        (p.category === "PANTS" || p.category === "JEANS" || p.category === "SHORTS") && p.image && p.image.indexOf('resources/') !== 0
    );

    if (sneakers.length === 0 || clothing.length === 0) return [];

    const sneakerIndex = periods % sneakers.length;
    const clothingIndex = periods % clothing.length;

    const result = [sneakers[sneakerIndex], clothing[clothingIndex]];

    if (accessories.length > 0) {
        const accIndex = (periods + 1) % accessories.length;
        result.push(accessories[accIndex]);
    }

    if (pants.length > 0) {
        const pantsIndex = (periods + 2) % pants.length;
        result.push(pants[pantsIndex]);
    }

    return result;
}

const featured = getFeaturedProducts();
const outputPath = join(root, 'featured.json');
writeFileSync(outputPath, JSON.stringify(featured, null, 2));
console.log(`✓ featured.json written with ${featured.length} products`);
