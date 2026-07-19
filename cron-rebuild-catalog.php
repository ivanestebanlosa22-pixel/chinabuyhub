<?php
// cron-rebuild-catalog.php — Call this URL every 12h via cron-job.org (same schedule as cron-featured.php)
//
// Rebuilds the per-category catalog chunks (data/<CATEGORY>.json) and the
// lightweight id -> category lookup (data/product-index.json) from products.js.

// Token check to prevent unauthorized access. Token lives outside the web
// root (secrets/chinabuyhub.env), same as GROQ_API_KEY — never hardcode it here.
require_once __DIR__ . '/ai-config.php';
$expectedToken = $_ENV['CRON_REBUILD_TOKEN'] ?? '';
$providedToken = $_GET['token'] ?? '';
if ($expectedToken === '' || !hash_equals($expectedToken, $providedToken)) {
    http_response_code(403);
    die('Forbidden: invalid or missing token');
}

//
// Why this exists: product.html and catalog.html used to load the entire
// products.js (7.9MB+) on every single page view. That's slow, fragile
// (large transfers can get truncated -> "Unexpected end of input" JS errors),
// and bad for Google crawl budget. Splitting into small per-category files
// means a product page only has to fetch ~190KB (index) + one small chunk,
// and the catalog page fetches 11 independent chunks instead of one giant
// blob, so a single failed/truncated chunk no longer takes down everything.
//
// This script is the single source of truth for regenerating those chunks
// whenever products.js is updated upstream.

header('Content-Type: text/plain; charset=UTF-8');

$productsRaw = file_get_contents(__DIR__ . '/products.js');
if ($productsRaw === false) {
    http_response_code(500);
    die('Failed to read products.js');
}

// Strip BOM, variable declaration, and trailing semicolon
$jsonStr = preg_replace('/^\xEF\xBB\xBF/', '', $productsRaw);
$jsonStr = preg_replace('/^const products\s*=\s*/', '', $jsonStr);
$jsonStr = preg_replace('/;\s*$/', '', $jsonStr);

$products = json_decode($jsonStr, true);
if ($products === null || !is_array($products) || count($products) === 0) {
    http_response_code(500);
    die('Failed to parse products.js JSON (or empty) — aborting to avoid wiping good data');
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Group products by category and build the id -> category index at the same time
$byCategory = [];
$index = [];
foreach ($products as $p) {
    $cat = isset($p['category']) && $p['category'] !== '' ? $p['category'] : 'OTHER';
    $byCategory[$cat][] = $p;
    if (!empty($p['id'])) {
        $index[$p['id']] = $cat;
    }
}

// Safety check: refuse to overwrite good chunks with a suspiciously empty result
if (count($index) < (count($products) * 0.95)) {
    http_response_code(500);
    die('Aborting: parsed product count looks incomplete (' . count($index) . ' of ' . count($products) . ')');
}

$written = [];
foreach ($byCategory as $cat => $items) {
    // Write to a temp file first, then atomically rename — avoids readers ever
    // seeing a half-written chunk mid-write.
    $target = $dataDir . '/' . $cat . '.json';
    $tmp = $target . '.tmp';
    $json = json_encode(array_values($items), JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        continue;
    }
    file_put_contents($tmp, $json);
    rename($tmp, $target);
    $written[$cat] = count($items);
}

// Same atomic-write pattern for the index and the legacy all-products.json
$indexTarget = $dataDir . '/product-index.json';
$indexTmp = $indexTarget . '.tmp';
file_put_contents($indexTmp, json_encode($index, JSON_UNESCAPED_SLASHES));
rename($indexTmp, $indexTarget);

$allTarget = $dataDir . '/all-products.json';
$allTmp = $allTarget . '.tmp';
file_put_contents($allTmp, json_encode(array_values($products), JSON_UNESCAPED_SLASHES));
rename($allTmp, $allTarget);

echo "OK: rebuilt " . count($written) . " category chunks + product-index.json (" . count($index) . " ids)\n";
foreach ($written as $cat => $n) {
    echo "  $cat: $n products\n";
}
