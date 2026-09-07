<?php
/**
 * RETIRED — unauthenticated website_orders insert without quote/payment flow.
 * Use /portfolio/api/quote.php or payment-init.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
http_response_code(410);
echo json_encode([
    'status' => 'error',
    'error' => 'Gone',
    'message' => 'This order path is retired. Submit a quote via /portfolio/api/quote.php or start deposit checkout.',
]);
