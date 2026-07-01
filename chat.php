<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/ai-config.php';

if (!defined('GROQ_API_KEY') || empty(GROQ_API_KEY)) {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$userMessage = trim($input['message'] ?? '');

if (!$userMessage) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

$conversation = $input['history'] ?? [];
$conversation[] = ['role' => 'user', 'content' => $userMessage];

$systemPrompt = <<<EOT
You are a virtual assistant for ChinaBuyHub, a website that helps people buy products from China using verified shopping agents.

ABOUT THE SITE:
- ChinaBuyHub compares Chinese shopping agents: USFans, Kakobuy, Litbuy
- Language: English
- URL: chinabuyhub.com

RECOMMENDED AGENTS:
1. USFans — Referral code: RCGD5Y, Bonus: up to €800. Ideal for beginners. Interface in Spanish/English. Shipping from 8€/kg.
2. Kakobuy — Referral code: FINDSES, Bonus: up to ¥3,000. Lowest service fees (4-6%). Fast processing.
3. Litbuy — Referral code: YBMHFG55L, Bonus: $500 in coupons. Competitive prices.

MAIN PAGES:
- /catalog — Catalog with 9,935+ verified products
- /agents — Agent comparison
- /how-to-buy — Step-by-step guide for buying from China
- /tools — Free tools (cost calculator, etc.)
- /blog — Blog with Weidian, Taobao, 1688 guides, shipping info
- /extension — Chrome extension to convert links to USFans

INSTRUCTIONS:
- Always greet at the start of each conversation in a friendly way
- Respond in the SAME language the user writes in (if they write in Spanish, respond in Spanish; if in English, respond in English; etc.)
- Be helpful, direct, and conversational
- If asked about buying from China, explain the process: choose an agent → find a product → agent purchases → QC photos → shipping
- Recommend specific pages on the site when relevant (e.g., "You can check our guide at /how-to-buy")
- Don't make up information about agents or prices that isn't provided here
- If you don't know something, say so honestly and suggest contacting info@chinabuyhub.com
- Keep responses brief (2-4 sentences per reply)
EOT;

$payload = [
    'model' => 'llama-3.1-8b-instant',
    'messages' => array_merge(
        [['role' => 'system', 'content' => $systemPrompt]],
        $conversation
    ),
    'temperature' => 0.7,
    'max_tokens' => 500,
];

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . GROQ_API_KEY,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'API request failed: ' . $error]);
    exit;
}

$data = json_decode($response, true);

if ($httpCode !== 200 || !isset($data['choices'][0]['message'])) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Groq API error',
        'detail' => $data['error']['message'] ?? 'Unknown error',
    ]);
    exit;
}

$reply = $data['choices'][0]['message']['content'];
$conversation[] = ['role' => 'assistant', 'content' => $reply];

echo json_encode([
    'reply' => $reply,
    'history' => $conversation,
]);
