<?php
/**
 * Parses products.js, splits by category into data/*.json files.
 * Run: php scripts/split-products.php
 */

$inPath = __DIR__ . '/../products.js';
$dataDir = __DIR__ . '/../data';

$raw = file_get_contents($inPath);

// Strip BOM and "const products = " prefix and trailing semicolon
$jsonStr = preg_replace('/^\xEF\xBB\xBF/', '', $raw);
$jsonStr = preg_replace('/^const products\s*=\s*/', '', $jsonStr);
$jsonStr = preg_replace('/;\s*$/', '', $jsonStr);

$products = json_decode($jsonStr, true);
if ($products === null) {
    die("Failed to parse products.js: " . json_last_error_msg() . "\n");
}

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Group by normalized category
$byCategory = [];
foreach ($products as $p) {
    $cat = strtoupper($p['category'] ?? 'OTHER');
    $byCategory[$cat][] = $p;
}

// Write per-category files
foreach ($byCategory as $cat => $items) {
    file_put_contents(
        "$dataDir/$cat.json",
        json_encode($items, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    );
    echo "  $cat: " . count($items) . " products -> data/$cat.json\n";
}

// Write combined file
file_put_contents(
    "$dataDir/all-products.json",
    json_encode($products, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
);
echo "\nTotal: " . count($products) . " products -> data/all-products.json\nCategories: " . count($byCategory) . "\n";
