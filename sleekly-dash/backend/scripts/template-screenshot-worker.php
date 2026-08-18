<?php

declare(strict_types=1);

/**
 * Capture gallery screenshots for a published template import job.
 *
 * Usage: php scripts/template-screenshot-worker.php <job-id>
 */

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../services/TemplateScreenshotService.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This worker may only run from the command line.\n");
    exit(1);
}

$jobIdRaw = $argv[1] ?? '';
if (!ctype_digit($jobIdRaw) || (int) $jobIdRaw < 1) {
    fwrite(STDERR, "Usage: php scripts/template-screenshot-worker.php <positive-job-id>\n");
    exit(2);
}
$jobId = (int) $jobIdRaw;

$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'sleeklybuilt';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
    $host,
    $port,
    $dbName
);

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $e) {
    fwrite(STDERR, 'Database connection failed: ' . $e->getMessage() . "\n");
    exit(3);
}

fwrite(STDOUT, '[' . gmdate('c') . "] Screenshot worker start job={$jobId}\n");

try {
    $service = new TemplateScreenshotService($pdo);
    $service->run($jobId);
    fwrite(STDOUT, '[' . gmdate('c') . "] Screenshot worker done job={$jobId}\n");
    exit(0);
} catch (Throwable $e) {
    fwrite(STDERR, '[' . gmdate('c') . '] Screenshot worker failed: ' . $e->getMessage() . "\n");
    exit(1);
}
