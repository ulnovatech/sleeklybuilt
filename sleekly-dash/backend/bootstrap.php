<?php
// bootstrap.php - load env, CORS, helpers

function load_env($path)
{
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (trim($line) === '' || str_starts_with(trim($line), '#')) {
            continue;
        }
        [$k, $v] = array_map('trim', explode('=', $line, 2));
        if (!getenv($k)) {
            putenv("$k=$v");
        }
    }
}

load_env(__DIR__ . '/.env');

$appDebug = getenv('APP_DEBUG') === 'true';
if ($appDebug) {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
}

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = getenv('ALLOWED_ORIGINS')
    ?: 'http://localhost:5174,http://localhost:5177,http://localhost:3000,http://localhost,http://hub.34.66.94.12.nip.io,http://34.66.94.12';
$allowedOrigins = array_filter(array_map('trim', explode(',', $allowed)));

// Capacitor Android (androidScheme=https) and iOS WebView origins — always allow.
// These are not public websites; they are the phone Admin APK / Cap host.
$capacitorOrigins = [
    'https://localhost',
    'http://localhost',
    'capacitor://localhost',
    'ionic://localhost',
];
$allowedOrigins = array_values(array_unique(array_merge($allowedOrigins, $capacitorOrigins)));

if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
} elseif ($origin === '' && php_sapi_name() !== 'cli') {
    // Same-origin / server-side requests
} else {
    // Block credentialed cross-origin requests from unknown origins
    if ($origin !== '') {
        http_response_code(403);
        echo json_encode(['error' => 'Origin not allowed']);
        exit;
    }
}

// Include Idempotency-Key — admin-mobile operator replies send it; missing it
// makes Capacitor/WebView CORS preflight fail with TypeError "Failed to fetch".
header('Access-Control-Allow-Headers: Content-Type, Authorization, Idempotency-Key, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Credentials: true');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_body()
{
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?: []) : [];
}

function respond($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function api_is_public_route(string $method, string $path): bool
{
    if ($method === 'OPTIONS') {
        return true;
    }
    if ($path === '/api/auth/login' && $method === 'POST') {
        return true;
    }
    if ($path === '/api/auth/register' && $method === 'POST') {
        return true;
    }
    if ($path === '/api/auth/forgot-password' && $method === 'POST') {
        return true;
    }
    if ($path === '/api/auth/reset-password' && $method === 'POST') {
        return true;
    }
    if ($path === '/api/auth/capabilities' && $method === 'GET') {
        return true;
    }
    if ($path === '/api/auth/logout' && $method === 'POST') {
        return true;
    }
    if ($path === '/api/auth/me' && $method === 'GET') {
        return true;
    }
    if ($path === '/api/auth/mobile/login' && $method === 'POST') {
        return true;
    }
    if ($path === '/api/auth/mobile/logout' && $method === 'POST') {
        return true;
    }
    if ($path === '/api/auth/mobile/me' && $method === 'GET') {
        return true;
    }
    if ($path === '/api/public/site-contact' && $method === 'GET') {
        return true;
    }
    if ($path === '/api/public/payment-providers' && $method === 'GET') {
        return true;
    }
    // Public APK update manifest (same data as /admin-app/latest.json)
    if ($path === '/api/mobile/app-update' && $method === 'GET') {
        return true;
    }
    return false;
}
