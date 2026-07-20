<?php
// Load environment variables from .env file.
// Try several candidate locations so it works regardless of hosting layout.
$envCandidates = [
    __DIR__ . '/.env',
    __DIR__ . '/secrets/chinabuyhub.env',
    dirname(__DIR__) . '/secrets/chinabuyhub.env',
    dirname(__DIR__, 2) . '/secrets/chinabuyhub.env',
    __DIR__ . '/../secrets/chinabuyhub.env',
    '/home/' . (getenv('USER') ?: '') . '/public_html/secrets/chinabuyhub.env',
    '/home/' . (getenv('USER') ?: '') . '/secrets/chinabuyhub.env',
];

$envFile = '';
foreach ($envCandidates as $candidate) {
    if ($candidate && file_exists($candidate)) {
        $envFile = $candidate;
        break;
    }
}

if ($envFile) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = ltrim($line);
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if ($name === '') continue;
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
            putenv("$name=$value");
        }
    }
}

define('GROQ_API_KEY', $_ENV['GROQ_API_KEY'] ?? '');
if (empty(GROQ_API_KEY) && isset($_ENV['groq_api_key'])) {
    define('GROQ_API_KEY', $_ENV['groq_api_key']);
}
