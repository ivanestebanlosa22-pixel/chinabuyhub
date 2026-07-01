<?php
// cron-featured.php — Call this URL every 12h via cron-job.org
// It regenerates featured.json from products.js

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
if ($products === null || !is_array($products)) {
    http_response_code(500);
    die('Failed to parse products.js JSON');
}

$now = new DateTime();
$periods = floor($now->getTimestamp() / (12 * 60 * 60));

$sneakers = array_values(array_filter($products, fn($p) =>
    ($p['category'] ?? '') === 'SNEAKERS'
    && !empty($p['image'])
    && strpos($p['image'], 'resources/') !== 0
    && !empty($p['brand'])
    && ($p['brand'] ?? '') !== 'Other'
));

$clothing = array_values(array_filter($products, fn($p) =>
    in_array($p['category'] ?? '', ['HOODIES', 'T-SHIRTS', 'JACKETS'])
    && !empty($p['image'])
    && strpos($p['image'], 'resources/') !== 0
));

$accessories = array_values(array_filter($products, fn($p) =>
    in_array($p['category'] ?? '', ['ACCESSORIES', 'BAGS', 'WATCHES', 'CAPS', 'HATS'])
    && !empty($p['image'])
    && strpos($p['image'], 'resources/') !== 0
));

$pants = array_values(array_filter($products, fn($p) =>
    in_array($p['category'] ?? '', ['PANTS', 'JEANS', 'SHORTS'])
    && !empty($p['image'])
    && strpos($p['image'], 'resources/') !== 0
));

if (count($sneakers) === 0 || count($clothing) === 0) {
    http_response_code(500);
    die('Not enough products to feature');
}

$result = [
    $sneakers[$periods % count($sneakers)],
    $clothing[$periods % count($clothing)],
];

if (count($accessories) > 0) {
    $result[] = $accessories[($periods + 1) % count($accessories)];
}

if (count($pants) > 0) {
    $result[] = $pants[($periods + 2) % count($pants)];
}

file_put_contents(__DIR__ . '/featured.json', json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo 'OK: featured.json regenerated with ' . count($result) . ' products';
