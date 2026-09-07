<?php
/**
 * RETIRED — unauthenticated order + template take without payment.
 * Use payment-init → verify/webhook for reservations, or quote.php for quote-only.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
http_response_code(410);
echo json_encode([
    'success' => false,
    'error' => 'Gone',
    'message' => 'Unauthenticated template reservation is retired. Pay a deposit to reserve, or submit a quote-only request via /portfolio/api/quote.php.',
]);
