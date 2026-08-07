<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../controllers/TemplateImportController.php';

$pdo = new PDO(
    sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        getenv('DB_HOST') ?: 'localhost',
        getenv('DB_PORT') ?: '3306',
        getenv('DB_NAME') ?: 'ulnovatech'
    ),
    getenv('DB_USER') ?: 'root',
    getenv('DB_PASS') ?: '',
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

$actor = '_template_hardening_' . bin2hex(random_bytes(4));
$prefix = 'hardening-' . bin2hex(random_bytes(4));
$jobIds = [];
$previousLimit = getenv('TEMPLATE_IMPORT_MAX_PER_HOUR');
putenv('TEMPLATE_IMPORT_MAX_PER_HOUR=2');

try {
    $controller = new TemplateImportController($pdo);
    for ($index = 1; $index <= 2; $index++) {
        $job = $controller->create([
            'source_url' => "https://{$prefix}-{$index}.webflow.io/",
            'title' => "Hardening {$index}",
            'description' => 'Rate and audit integration test.',
            'category' => 'test',
            'collection' => 'websites',
        ], ['username' => $actor]);
        $jobIds[] = (int) $job['id'];
    }

    try {
        $controller->create([
            'source_url' => "https://{$prefix}-3.webflow.io/",
            'title' => 'Hardening 3',
            'category' => 'test',
            'collection' => 'websites',
        ], ['username' => $actor]);
        throw new RuntimeException('Third import unexpectedly bypassed the hourly limit.');
    } catch (RuntimeException $e) {
        if ($e->getCode() !== 429) {
            throw $e;
        }
    }

    $audit = $pdo->prepare(
        "SELECT COUNT(*)
         FROM template_import_audit_events
         WHERE actor = :actor AND action = 'import_queued'"
    );
    $audit->execute(['actor' => $actor]);
    if ((int) $audit->fetchColumn() !== 2) {
        throw new RuntimeException('Import audit events were not persisted.');
    }

    fwrite(STDOUT, "Template rate limit and audit tests passed.\n");
} finally {
    $deleteAudit = $pdo->prepare(
        'DELETE FROM template_import_audit_events WHERE actor = :actor'
    );
    $deleteAudit->execute(['actor' => $actor]);
    $deleteJobs = $pdo->prepare(
        'DELETE FROM template_import_jobs WHERE created_by = :actor'
    );
    $deleteJobs->execute(['actor' => $actor]);
    if ($previousLimit === false) {
        putenv('TEMPLATE_IMPORT_MAX_PER_HOUR');
    } else {
        putenv('TEMPLATE_IMPORT_MAX_PER_HOUR=' . $previousLimit);
    }
}
