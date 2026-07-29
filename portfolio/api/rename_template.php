<?php

declare(strict_types=1);

/**
 * Retired legacy endpoint.
 *
 * This script previously scanned an obsolete directory, assigned every
 * template to a hardcoded category, and mutated the database without
 * authentication. Template publication is now owned by the authenticated
 * Unldash import workflow.
 */

$message = [
    'error' => 'Template registration through rename_template.php has been retired.',
    'code' => 'TEMPLATE_IMPORT_LEGACY_ENDPOINT_RETIRED',
    'next' => 'Use the authenticated Unldash Templates workflow.',
];

if (PHP_SAPI === 'cli') {
    fwrite(STDERR, $message['error'] . PHP_EOL);
    fwrite(STDERR, $message['next'] . PHP_EOL);
    exit(1);
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
http_response_code(410);
echo json_encode($message, JSON_UNESCAPED_SLASHES);
