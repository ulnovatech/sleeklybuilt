<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../controllers/TemplateImportController.php';

$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'ulnovatech';
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
$terminal = false;

try {
    $controller = new TemplateImportController($pdo, new TemplateImportLauncher());
    $job = $controller->create(
        [
            'source_url' => 'https://willey-fragrance.webflow.io/',
            'title' => 'Background import validation',
            'category' => 'test',
            'collection' => 'websites',
        ],
        ['username' => '_template_import_background_test']
    );
    $jobId = (int) $job['id'];

    $deadline = microtime(true) + 180;
    do {
        usleep(500_000);
        $stmt = $pdo->prepare(
            'SELECT status, staging_path, report_json, error_message
             FROM template_import_jobs
             WHERE id = :id'
        );
        $stmt->execute(['id' => $jobId]);
        $row = $stmt->fetch();
        if (!is_array($row)) {
            throw new RuntimeException('Background import job disappeared.');
        }

        if ($row['status'] === 'failed') {
            $terminal = true;
            throw new RuntimeException(
                'Background worker failed: ' . (string) $row['error_message']
            );
        }
        if ($row['status'] === 'ready') {
            $terminal = true;
            $stagingPath = $row['staging_path'];
            $report = json_decode((string) $row['report_json'], true, 512, JSON_THROW_ON_ERROR);
            if (
                ($report['phase'] ?? null) !== 'ready' ||
                ($report['scrub']['cta_scripts_injected'] ?? 0) < 1
            ) {
                throw new RuntimeException('Background import report is incomplete.');
            }
            break;
        }
    } while (microtime(true) < $deadline);

    if (!$terminal) {
        throw new RuntimeException('Background import did not finish within 180 seconds.');
    }
    $workerLog = TemplateImportPolicy::logDirectory() . DIRECTORY_SEPARATOR . "job-{$jobId}.log";
    if (!is_file($workerLog)) {
        throw new RuntimeException('Background worker did not write its persistent job log.');
    }

    fwrite(STDOUT, "Template background launch lifecycle passed.\n");
} finally {
    if ($terminal && is_string($stagingPath) && is_dir($stagingPath)) {
        removeBackgroundTestDirectory($stagingPath);
    }
    if ($terminal && is_int($jobId) && $jobId > 0) {
        $auditCleanup = $pdo->prepare(
            "DELETE FROM template_import_audit_events
             WHERE job_id = :id AND actor = '_template_import_background_test'"
        );
        $auditCleanup->execute(['id' => $jobId]);
        $cleanup = $pdo->prepare(
            "DELETE FROM template_import_jobs
             WHERE id = :id AND created_by = '_template_import_background_test'"
        );
        $cleanup->execute(['id' => $jobId]);
        @unlink(
            TemplateImportPolicy::logDirectory() .
            DIRECTORY_SEPARATOR .
            "job-{$jobId}.log"
        );
    }
}

function removeBackgroundTestDirectory(string $path): void
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
