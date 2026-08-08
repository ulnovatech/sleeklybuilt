<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../controllers/TemplateImportController.php';

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

$pdo = new PDO(
    $dsn,
    $user,
    $pass,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

$jobId = null;
$stagingPath = null;

try {
    $controller = new TemplateImportController($pdo);
    $sourceHost = 'willey-fragrance.webflow.io';
    $job = $controller->create(
        [
            'source_url' => 'https://' . $sourceHost . '/',
            'title' => 'Lifecycle validation',
            'description' => 'Transient integration test job.',
            'category' => 'test',
            'collection' => 'websites',
        ],
        ['username' => '_template_import_test']
    );

    $jobId = (int) $job['id'];
    if ($job['status'] !== 'queued' || $job['slug'] !== $sourceHost || ($job['collection'] ?? null) !== 'websites') {
        throw new RuntimeException('Controller did not create the expected queued job.');
    }

    try {
        $controller->create(
            [
                'source_url' => 'https://' . $sourceHost . '/another-page',
                'title' => 'Duplicate lifecycle validation',
                'category' => 'test',
                'collection' => 'websites',
            ],
            ['username' => '_template_import_test']
        );
        throw new RuntimeException('A duplicate active import was accepted.');
    } catch (RuntimeException $e) {
        if ($e->getCode() !== 409) {
            throw $e;
        }
    }

    $command = [
        PHP_BINARY,
        __DIR__ . '/../scripts/template-import-worker.php',
        (string) $jobId,
    ];
    $pipes = [];
    $process = proc_open(
        $command,
        [
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ],
        $pipes
    );
    if (!is_resource($process)) {
        throw new RuntimeException('Unable to start the template import worker.');
    }

    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $exitCode = proc_close($process);

    if ($exitCode !== 0) {
        throw new RuntimeException(
            'Worker failed: ' . trim((string) $stderr)
        );
    }

    $workerResult = json_decode((string) $stdout, true, 512, JSON_THROW_ON_ERROR);
    if (($workerResult['status'] ?? null) !== 'ready') {
        throw new RuntimeException('Worker did not complete the template import.');
    }

    $stmt = $pdo->prepare(
        'SELECT status, staging_path, started_at, report_json
         FROM template_import_jobs
         WHERE id = :id'
    );
    $stmt->execute(['id' => $jobId]);
    $claimed = $stmt->fetch();
    if (!is_array($claimed) || $claimed['status'] !== 'ready') {
        throw new RuntimeException('Completed job was not persisted as ready.');
    }
    if (!is_string($claimed['started_at']) || $claimed['started_at'] === '') {
        throw new RuntimeException('Claimed job has no start timestamp.');
    }

    $stagingPath = $claimed['staging_path'];
    if (!is_string($stagingPath) || !is_dir($stagingPath)) {
        throw new RuntimeException('Worker did not create private staging.');
    }

    $report = json_decode((string) $claimed['report_json'], true, 512, JSON_THROW_ON_ERROR);
    if (($report['phase'] ?? null) !== 'ready') {
        throw new RuntimeException('Import report does not reflect the ready phase.');
    }

    $indexPath = $stagingPath . DIRECTORY_SEPARATOR . 'site' . DIRECTORY_SEPARATOR . 'index.html';
    $indexHtml = is_file($indexPath) ? file_get_contents($indexPath) : false;
    if (!is_string($indexHtml)) {
        throw new RuntimeException('Imported staging site has no index.html.');
    }
    if (!str_contains($indexHtml, '/portfolio/portfolio/cta.js')) {
        throw new RuntimeException('Imported index is missing the absolute SleeklyBuilt CTA.');
    }
    $sellerSignals = array_values(array_filter([
        stripos($indexHtml, 'hireus-') !== false ? 'hireus-' : null,
        stripos($indexHtml, 'webocean') !== false ? 'webocean' : null,
        stripos($indexHtml, 'webflow.com/templates') !== false ? 'webflow.com/templates' : null,
    ]));
    if ($sellerSignals !== []) {
        throw new RuntimeException(
            'Seller promotion survived the offline scrub: ' . implode(', ', $sellerSignals)
        );
    }

    fwrite(STDOUT, "Template acquisition and scrub lifecycle passed.\n");
} finally {
    if (is_string($stagingPath) && is_dir($stagingPath)) {
        removeTestDirectory($stagingPath);
    }
    if (is_int($jobId) && $jobId > 0) {
        $cleanup = $pdo->prepare(
            "DELETE FROM template_import_jobs
             WHERE id = :id AND created_by = '_template_import_test'"
        );
        $cleanup->execute(['id' => $jobId]);
    }
}

function removeTestDirectory(string $path): void
{
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($iterator as $entry) {
        if ($entry->isDir() && !$entry->isLink()) {
            @rmdir($entry->getPathname());
        } else {
            @unlink($entry->getPathname());
        }
    }
    @rmdir($path);
}
