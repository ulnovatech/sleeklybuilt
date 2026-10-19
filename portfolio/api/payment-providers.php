<?php

declare(strict_types=1);

/**
 * Public active MTN / Airtel merchant instructions for checkout.
 * Reads payment_provider_config (dash Settings → Payments). Never hardcodes codes.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/cors.php';
require_once __DIR__ . '/lib/schema.php';

uln_portfolio_cors(true);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$providers = uln_load_active_payment_providers($pdo);
$usable = array_values(array_filter($providers, static fn(array $p): bool => $p['configured']));

echo json_encode([
    'success' => true,
    'providers' => $usable,
    'unavailable' => $usable === [],
    'message' => $usable === []
        ? 'Mobile money checkout is temporarily unavailable. Request a quote or contact us.'
        : null,
]);
