<?php
/**
 * RETIRED — unauthenticated template INSERT. Registration uses the authenticated dash workflow.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
http_response_code(410);
echo json_encode([
    'success' => false,
    'error' => 'Gone',
    'message' => 'Unauthenticated template registration is retired.',
]);
