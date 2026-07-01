/* ============================================
   ChinaBuyHub — Template Description Generator
   Generates varied, SEO-friendly descriptions
   using smart templates. No API needed.
   ============================================ */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcFile = resolve(root, 'products.js');

console.log('Loading products...');
const raw = readFileSync(srcFile, 'utf-8');
const match = raw.match(/const products = (\[[\s\S]*\]);?/);
const products = JSON.parse(match[1]);

// SEO keyword pools
const qualityAdj = ['premium', 'high-quality', 'top-tier', 'luxury', 'designer', 'elite', 'finely crafted', 'precision-made', 'meticulously crafted', 'expertly made', 'carefully constructed', 'masterfully produced'];
const styleNotes = ['versatile enough for everyday wear', 'perfect for casual outings', 'elevates any outfit instantly', 'designed to turn heads', 'combines comfort with style', 'a wardrobe essential', 'ideal for streetwear looks', 'makes a bold statement', 'effortlessly cool', 'blends comfort and fashion'];
const valueProps = ['an incredible value at just', 'priced affordably at', 'a steal at only', 'surprisingly affordable at', 'get the look without the markup at'];
const actionPhrases = ['Order now from your favorite agent.', 'Add to your collection today.', 'Don\'t miss out on this piece.', 'Grab yours before it sells out.', 'Shop with confidence.', 'Click to buy from trusted agents.'];

// Templates per category
const templateBank = {
  SNEAKERS: [
    'Step up your sneaker game with the {name}. These {brand} kicks feature {quality} construction with attention to every detail. {style}. {value} ${price}. {action}',
    'The {name} brings {brand}\'s iconic design within reach. {quality} materials and precise stitching make these a standout. {style}. {value} ${price}. {action}',
    'Turn heads with the {name}. {quality} craftsmanship meets {brand}\'s signature aesthetic. {style}. {value} ${price}. {action}',
    '{brand} fans, this one\'s for you. The {name} delivers authentic styling with {quality} build quality. {style}. {value} ${price}. {action}',
    'From the streets to the scene, the {name} makes an impression. {quality} replicas with accurate shape, color, and detailing. {style}. {value} ${price}. {action}',
  ],
  T_SHIRTS: [
    'Keep it fresh with the {name}. This {quality} tee from {brand} features soft fabric and a comfortable fit. {style}. {value} ${price}. {action}',
    'The {name} is your new go-to. {quality} materials and {brand}\'s unmistakable style make this a must-have. {style}. {value} ${price}. {action}',
    'Upgrade your rotation with the {name}. {quality} construction and a perfect fit from {brand}. {style}. {value} ${price}. {action}',
    'Style meets comfort in the {name}. {quality} fabric with sharp {brand} graphics that last wash after wash. {style}. {value} ${price}. {action}',
    'A {quality} {brand} piece that speaks for itself. The {name} pairs with anything. {style}. {value} ${price}. {action}',
  ],
  HOODIES: [
    'Layer up with the {name}. This {quality} {brand} hoodie delivers warmth and style in equal measure. {style}. {value} ${price}. {action}',
    'The {name} is the hoodie your wardrobe needs. {quality} fabric with a comfortable oversized fit from {brand}. {style}. {value} ${price}. {action}',
    'Cozy meets cool with the {name}. {quality} {brand} craftsmanship with a soft brushed interior. {style}. {value} ${price}. {action}',
    '{Brand}\'s {name} brings streetwear energy to any fit. {quality} build with attention to every stitch. {style}. {value} ${price}. {action}',
    'Stay warm and stylish in the {name}. {quality} materials from {brand} with a perfect relaxed silhouette. {style}. {value} ${price}. {action}',
  ],
  JACKETS: [
    'Brave the elements in style with the {name}. This {quality} {brand} jacket combines function and fashion. {style}. {value} ${price}. {action}',
    'The {name} from {brand} is built to impress. {quality} outerwear with premium insulation and sharp details. {style}. {value} ${price}. {action}',
    'Make a statement with the {name}. {quality} {brand} design that keeps you warm without sacrificing style. {style}. {value} ${price}. {action}',
    'A {quality} {brand} jacket that works with everything. The {name} features expert tailoring and durable materials. {style}. {value} ${price}. {action}',
    'Elevate your outerwear with the {name}. {quality} {brand} craftsmanship meets practical, everyday wearability. {style}. {value} ${price}. {action}',
  ],
  PANTS: [
    'Find your perfect fit with the {name}. {quality} {brand} pants with a modern cut and comfortable fabric. {style}. {value} ${price}. {action}',
    'The {name} from {brand} delivers on both style and comfort. {quality} construction with a flattering silhouette. {style}. {value} ${price}. {action}',
    'Upgrade your bottom game with the {name}. {quality} {brand} design that looks as good as it feels. {style}. {value} ${price}. {action}',
    '{Quality} {brand} pants that move with you. The {name} features a perfect balance of structure and stretch. {style}. {value} ${price}. {action}',
    'Versatility meets quality in the {name}. {quality} {brand} craftsmanship that works for any occasion. {style}. {value} ${price}. {action}',
  ],
  SHORTS: [
    'Stay cool in the {name}. {quality} {brand} shorts designed for comfort and style. {style}. {value} ${price}. {action}',
    'The {name} from {brand} is summer-ready. {quality} materials with a relaxed fit that looks great. {style}. {value} ${price}. {action}',
    'Warm weather essential: the {name}. {quality} {brand} shorts with a clean, modern cut. {style}. {value} ${price}. {action}',
    '{Quality} {brand} shorts that keep you looking fresh. The {name} pairs with any tee or hoodie. {style}. {value} ${price}. {action}',
    'Beat the heat with the {name}. {quality} construction from {brand} that lasts season after season. {style}. {value} ${price}. {action}',
  ],
  ACCESSORIES: [
    'Complete your look with the {name}. This {quality} accessory from {brand} adds the perfect finishing touch. {style}. {value} ${price}. {action}',
    'The {name} is the detail that makes the difference. {quality} {brand} craftsmanship in a compact package. {style}. {value} ${price}. {action}',
    'Accessorize right with the {name}. {quality} {brand} design that elevates any outfit instantly. {style}. {value} ${price}. {action}',
    'A {quality} {brand} piece that belongs in your collection. The {name} delivers style without compromise. {style}. {value} ${price}. {action}',
    'The finishing touch your outfit needs: the {name}. {quality} materials from {brand}. {style}. {value} ${price}. {action}',
  ],
  BAGS: [
    'Carry your essentials in style with the {name}. This {quality} {brand} bag combines function and fashion. {style}. {value} ${price}. {action}',
    'The {name} from {brand} is your new everyday companion. {quality} materials with ample space and smart design. {style}. {value} ${price}. {action}',
    'Make a statement with the {name}. {quality} {brand} craftsmanship in a versatile, eye-catching design. {style}. {value} ${price}. {action}',
    '{Quality} {brand} bag that works from day to night. The {name} features durable construction and timeless style. {style}. {value} ${price}. {action}',
    'Upgrade your carry with the {name}. {quality} {brand} design with practical compartments and premium finish. {style}. {value} ${price}. {action}',
  ],
  CAPS: [
    'Top off your fit with the {name}. This {quality} {brand} cap brings instant style to any look. {style}. {value} ${price}. {action}',
    'The {name} from {brand} is the hat your collection needs. {quality} construction with a perfect fit. {style}. {value} ${price}. {action}',
    'Keep it casual with the {name}. {quality} {brand} headwear that looks good on everyone. {style}. {value} ${price}. {action}',
    '{Quality} {brand} cap with unmistakable style. The {name} features an adjustable fit. {style}. {value} ${price}. {action}',
    'Shade in style with the {name}. {quality} {brand} cap built for everyday wear. {style}. {value} ${price}. {action}',
  ],
  ELECTRONICS: [
    'Tech meets style with the {name}. This {quality} {brand} accessory protects and personalizes your device. {style}. {value} ${price}. {action}',
    'The {name} is a must-have for any {brand} fan. {quality} design that\'s as functional as it is stylish. {style}. {value} ${price}. {action}',
    'Upgrade your tech game with the {name}. {quality} {brand} accessory built to impress. {style}. {value} ${price}. {action}',
    'A {quality} {brand} piece for your daily carry. The {name} combines protection with premium style. {style}. {value} ${price}. {action}',
    '{Quality} {brand} tech accessory that stands out. The {name} delivers on both form and function. {style}. {value} ${price}. {action}',
  ],
  WOMAN: [
    'Look and feel amazing in the {name}. This {quality} {brand} piece is designed to flatter. {style}. {value} ${price}. {action}',
    'The {name} from {brand} is your new favorite. {quality} materials with a feminine, flattering cut. {style}. {value} ${price}. {action}',
    'Turn heads with the {name}. {quality} {brand} design that celebrates your style. {style}. {value} ${price}. {action}',
    'Effortless elegance: the {name}. {quality} {brand} craftsmanship with a perfect fit. {style}. {value} ${price}. {action}',
    'A {quality} {brand} piece made for you. The {name} brings confidence and style together. {style}. {value} ${price}. {action}',
  ],
};

const DEFAULT_TEMPLATES = [
  'Discover the {name}. {quality} {brand} design with attention to every detail. {style}. {value} ${price}. {action}',
  'The {name} delivers {brand}\'s signature look at a fraction of the price. {quality} construction throughout. {style}. {value} ${price}. {action}',
  'Get the look with the {name}. {quality} {brand} replica that nails every detail. {style}. {value} ${price}. {action}',
  '{Quality} craftsmanship meets {brand}\'s iconic design in the {name}. {style}. {value} ${price}. {action}',
  'Add the {name} to your rotation. {quality} {brand} piece that doesn\'t compromise on style. {style}. {value} ${price}. {action}',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function brandName(p) {
  const b = (p.brand || '').trim();
  if (b && b !== 'Unknown' && b !== 'Other' && b.length > 1) return b;
  return '';
}

function generateDesc(p, templateIndex) {
  const cat = (p.category || 'T-SHIRTS').toUpperCase();
  const brand = brandName(p);
  const catTemplates = templateBank[cat] || DEFAULT_TEMPLATES;
  const tmpl = catTemplates[templateIndex % catTemplates.length];
  
  let desc = tmpl
    .replace(/\{name\}/g, p.name || 'this product')
    .replace(/\{quality\}/g, pick(qualityAdj))
    .replace(/\{style\}/g, pick(styleNotes))
    .replace(/\{value\}/g, pick(valueProps))
    .replace(/\{price\}/g, p.price || '0')
    .replace(/\{action\}/g, pick(actionPhrases));
  
  // Handle brand placeholders smartly
  if (brand) {
    desc = desc.replace(/\{brand\}/g, brand);
    // Fix double "brand brand" (e.g. "designer designer jacket")
    desc = desc.replace(new RegExp('\\b' + brand + ' ' + brand + '\\b', 'gi'), brand);
  } else {
    // No brand - use generic replacements
    desc = desc.replace(/\{brand\}/g, 'this');
    desc = desc.replace(/\bthis fans\b/gi, 'sneaker fans');
    desc = desc.replace(/\bfrom this\b/gi, '');
    desc = desc.replace(/A this this/gi, 'This');
    desc = desc.replace(/\. this this/gi, '. This');
    desc = desc.replace(/\bthis's\b/gi, 'its');
  }

  // Clean up any remaining double spaces or awkward constructions
  desc = desc.replace(/  +/g, ' ');
  desc = desc.replace(/\. \./g, '.');
  
  return desc;
}

let generated = 0;
let skipped = 0;

// Product-specific overrides for special items
const specialOverrides = {
  // High heels get fashion-forward descriptions
};

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const oldDesc = (p.description || '').toLowerCase();
  
  // Skip products that already have good descriptions (longer, unique ones)
  if (oldDesc.length > 100 && 
      !oldDesc.includes('quality fabric') && 
      !oldDesc.includes('solid construction') &&
      !oldDesc.includes('fast shipping') &&
      !oldDesc.includes('good materials') &&
      !oldDesc.includes('practical design') &&
      !oldDesc.includes('qc approved') &&
      !oldDesc.includes('premium batch') &&
      !oldDesc.includes('community tested')) {
    skipped++;
    continue;
  }

  // Vary template based on product ID hash to avoid repetition
  const hash = p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const templateIdx = hash % 5;
  
  p.description = generateDesc(p, templateIdx + (i % 3)); // extra variation
  generated++;
}

// Save
const newContent = 'const products = ' + JSON.stringify(products) + ';';
writeFileSync(srcFile, newContent);

console.log(`\nGenerated: ${generated} descriptions`);
console.log(`Skipped (already good): ${skipped}`);
console.log(`Total: ${products.length}`);
console.log(`Saved to products.js (${(newContent.length/1024/1024).toFixed(1)} MB)`);
