<?php

function uln_portfolio_allowed_origins(): array
{
    $raw = getenv('PORTFOLIO_ALLOWED_ORIGINS') ?: getenv('ALLOWED_ORIGINS') ?: '';
    if ($raw === '') {
        $raw = implode(',', [
            'https://sleeklybuilt.pro',
            'https://www.sleeklybuilt.pro',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5175',
            'http://127.0.0.1:5176',
        ]);
    }

    return array_values(array_filter(array_map('trim', explode(',', $raw))));
}

/**
 * CORS for portfolio APIs. Mutating endpoints use an origin allowlist.
 * Public catalog GETs may pass $publicRead=true for wildcard (browser embeds only).
 */
function uln_portfolio_cors(bool $publicRead = false): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, verif-hash');
    header('Vary: Origin');

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = uln_portfolio_allowed_origins();

    if ($publicRead && $origin === '') {
        // Same-origin / non-browser
    } elseif ($publicRead) {
        header('Access-Control-Allow-Origin: *');
    } elseif ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } elseif ($origin !== '') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Origin not allowed']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function uln_json_input(): array
{
    $data = json_decode((string) file_get_contents('php://input'), true);

    return is_array($data) ? $data : [];
}
