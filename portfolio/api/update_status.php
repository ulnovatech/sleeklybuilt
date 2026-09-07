<?php
/**
 * RETIRED — unauthenticated template status mutation.
 * Template reservation is only via verified payment (payment-verify / webhook).
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
http_response_code(410);
echo json_encode([
    'success' => false,
    'error' => 'Gone',
    'message' => 'Direct template status updates are retired. Status changes only after verified payment.',
]);
