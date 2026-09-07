<?php
/**
 * Quote-only website order — does NOT reserve or mark templates taken.
 */
declare(strict_types=1);

require_once __DIR__ . '/lib/cors.php';
uln_portfolio_cors();

require_once __DIR__ . '/../../php/leads/website_order_submit.php';

$fields = uln_json_input();
if ($fields === []) {
    // Also accept form-encoded fallbacks
    $fields = [
        'template' => $_POST['template'] ?? $_POST['websiteName'] ?? '',
        'websiteName' => $_POST['websiteName'] ?? '',
        'fullName' => $_POST['fullName'] ?? '',
        'phone' => $_POST['phone'] ?? '',
        'countryCode' => $_POST['countryCode'] ?? '',
        'businessName' => $_POST['businessName'] ?? '',
        'notes' => $_POST['notes'] ?? '',
        'package' => $_POST['package'] ?? '',
    ];
}

$result = uln_website_order_quote(array_merge($fields, [
    'source' => 'portfolio_quote',
]));
http_response_code((int) ($result['http'] ?? 500));
unset($result['http'], $result['ok']);
echo json_encode($result);
