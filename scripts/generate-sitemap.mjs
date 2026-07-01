import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const productsFile = resolve(root, 'products.js');
const sitemapDir = resolve(root, 'sitemaps');

if (!existsSync(sitemapDir)) {
    import('fs').then(fs => fs.mkdirSync(sitemapDir, { recursive: true }));
}

console.log('Loading products...');
const raw = readFileSync(productsFile, 'utf-8');
const match = raw.match(/const products = (\[[\s\S]*\]);?/);
if (!match) {
    console.error('Could not parse products.js');
    process.exit(1);
}
const products = JSON.parse(match[1]);

const validProducts = products.filter(p => p.image && p.image.startsWith('http'));
console.log(`Total products: ${products.length}, Valid (with images): ${validProducts.length}`);

const baseUrl = 'https://www.chinabuyhub.com';
const today = new Date().toISOString().split('T')[0];
const MAX_URLS_PER_SITEMAP = 45000;
const sitemaps = [];

for (let i = 0; i < validProducts.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = validProducts.slice(i, i + MAX_URLS_PER_SITEMAP);
    const sitemapNum = Math.floor(i / MAX_URLS_PER_SITEMAP) + 1;
    1;
    const filename = sitemapNum === 1 ? 'sitemap-products.xml' : `sitemap-products-${sitemapNum}.xml`;
    const filepath = resolve(sitemapDir, filename);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const product of chunk) {
        const url = `${baseUrl}/product?id=${product.id}`;
        xml += `  <url>\n`;
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
    }

    xml += '</urlset>\n';
    writeFileSync(filepath, xml);
    sitemaps.push({ filename, count: chunk.length });
    console.log(`Generated ${filename} with ${chunk.length} URLs`);
}

const indexPath = resolve(sitemapDir, 'sitemap-products-index.xml');
let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
indexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const s of sitemaps) {
    indexXml += `  <sitemap>\n`;
    indexXml += `    <loc>${baseUrl}/sitemaps/${s.filename}</loc>\n`;
    indexXml += `    <lastmod>${today}</lastmod>\n`;
    indexXml += `  </sitemap>\n`;
}
indexXml += '</sitemapindex>\n';
writeFileSync(indexPath, indexXml);
console.log(`Generated sitemap index with ${sitemaps.length} sitemaps`);

console.log('\nAdd to robots.txt:');
for (const s of sitemaps) {
    console.log(`Sitemap: ${baseUrl}/sitemaps/${s.filename}`);
}
console.log(`Sitemap: ${baseUrl}/sitemaps/sitemap-products-index.xml`);