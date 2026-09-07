<?php
/**
 * RETIRED — misspelled catalog dump. Use /portfolio/api/portfolios.php
 */
require_once __DIR__ . '/lib/cors.php';
uln_portfolio_cors(true);
http_response_code(410);
echo json_encode([
    'success' => false,
    'error' => 'Gone',
    'message' => 'This catalog path is retired. Use /portfolio/api/portfolios.php',
]);
