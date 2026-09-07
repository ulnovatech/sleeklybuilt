<?php
/**
 * RETIRED — debug dumper (display_errors, filesystem dump). Templates are served from the gallery SPA.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
http_response_code(410);
echo json_encode([
    'success' => false,
    'error' => 'Gone',
    'message' => 'Direct template PHP preview is retired. Use the portfolio gallery.',
]);
