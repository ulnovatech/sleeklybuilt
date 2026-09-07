<?php
/**
 * RETIRED — duplicate of portfolio-detail.php
 */
require_once __DIR__ . '/../lib/cors.php';
uln_portfolio_cors(true);
http_response_code(410);
echo json_encode([
    'success' => false,
    'error' => 'Gone',
    'message' => 'Use /portfolio/api/portfolio-detail.php?template=',
]);
