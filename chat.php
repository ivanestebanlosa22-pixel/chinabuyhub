<?php
header('Content-Type: application/json; charset=utf-8');

// Restrict CORS to specific domains
$allowedOrigins = [
    'https://www.chinabuyhub.com',
    'https://chinabuyhub.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Vary: Origin');
}

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
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body']);
    exit;
}

// DEFAULT SYSTEM PROMPT
$defaultSystem = 'You are the ChinaBuyHub assistant. ChinaBuyHub specializes in Chinese shopping agents (USFans code RCGD5Y, Kakobuy code FINDSES, LitBuy code YBMHFG55L, Sugargoo, Pandabuy) and buying via Taobao, Weidian and 1688. Help users choose agents, understand costs (product + shipping + taxes), find products, and navigate the buying process. Respond in the same language the user uses (English or Spanish). Be concise, practical and honest.';

// Support both formats:
// New: {messages: [{role, content}, ...], system?: "..."}
// Old: {message: "string", history?: [...]}
if (isset($input['messages']) && is_array($input['messages'])) {
    // New format
    $messages = array_slice($input['messages'], -20); // last 20 max
    $systemPrompt = isset($input['system']) && !empty($input['system']) ? $input['system'] : $defaultSystem;
} elseif (isset($input['message'])) {
    // Old format — convert
    $userMessage = trim($input['message']);
    if (!$userMessage) {
        http_response_code(400);
        echo json_encode(['error' => 'Message is required']);
        exit;
    }
    $history = isset($input['history']) && is_array($input['history']) ? $input['history'] : [];
    $messages = $history;
    $messages[] = ['role' => 'user', 'content' => $userMessage];
    $systemPrompt = $defaultSystem;
} else {
    http_response_code(400);
    echo json_encode(['error' => 'No message provided']);
    exit;
}

// Validate messages structure
$validMessages = [];
foreach ($messages as $msg) {
    if (isset($msg['role'], $msg['content']) && in_array($msg['role'], ['user', 'assistant', 'system'])) {
        $validMessages[] = [
            'role' => $msg['role'],
            'content' => substr(strval($msg['content']), 0, 4000) // limit per message
        ];
    }
}
if (empty($validMessages)) {
    http_response_code(400);
    echo json_encode(['error' => 'No valid messages']);
    exit;
}

$payload = [
    'model' => 'llama-3.1-8b-instant',
    'messages' => array_merge(
        [['role' => 'system', 'content' => $systemPrompt]],
        $validMessages
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
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'cURL error: ' . $curlError]);
    exit;
}

$data = json_decode($response, true);

if ($httpCode !== 200 || !isset($data['choices'][0]['message']['content'])) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Groq API error',
        'detail' => isset($data['error']['message']) ? $data['error']['message'] : 'Unknown error',
    ]);
    exit;
}

// Return full Groq format so widget can parse choices[0].message.content
echo json_encode($data);
