<?php

declare(strict_types=1);

/**
 * Claim, acquire, scrub, and validate a queued Webflow template import.
 *
 * Usage: php scripts/template-import-worker.php <job-id>
 */

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../config/TemplateImportPolicy.php';
require_once __DIR__ . '/../services/TemplateSourceValidator.php';
require_once __DIR__ . '/../services/TemplateAcquirer.php';
require_once __DIR__ . '/../services/TemplateScrubber.php';
require_once __DIR__ . '/../services/TemplatePublishValidator.php';
require_once __DIR__ . '/../services/TemplateAssetProbe.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This worker may only run from the command line.\n");
    exit(1);
}

$jobIdRaw = $argv[1] ?? '';
if (!ctype_digit($jobIdRaw) || (int) $jobIdRaw < 1) {
    fwrite(STDERR, "Usage: php scripts/template-import-worker.php <positive-job-id>\n");
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

$pdo = new PDO(
    $dsn,
    $user,
    $pass,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

$stagingPath = null;
$report = [];
$job = null;
$claimed = false;

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        'SELECT id, status, source_url, slug, report_json
         FROM template_import_jobs
         WHERE id = :id
         FOR UPDATE'
    );
    $stmt->execute(['id' => $jobId]);
    $job = $stmt->fetch();

    if (!is_array($job)) {
        throw new RuntimeException("Template import job {$jobId} was not found.", 404);
    }
    if ($job['status'] !== 'queued') {
        throw new RuntimeException(
            "Template import job {$jobId} cannot be claimed from status {$job['status']}.",
            409
        );
    }

    $canonicalSlug = TemplateImportPolicy::folderIdFromSourceUrl((string) $job['source_url']);
    if ($canonicalSlug === null || !hash_equals((string) $job['slug'], $canonicalSlug)) {
        throw new RuntimeException('Stored source URL and slug failed policy validation.', 422);
    }

    $stagingRoot = TemplateImportPolicy::stagingRoot();
    if (!is_dir($stagingRoot) && !mkdir($stagingRoot, 0700, true) && !is_dir($stagingRoot)) {
        throw new RuntimeException('Unable to create the template import staging root.');
    }
    if (is_link($stagingRoot) || !is_writable($stagingRoot)) {
        throw new RuntimeException('Template import staging root is not a writable private directory.');
    }

    $stagingPath = $stagingRoot .
        DIRECTORY_SEPARATOR .
        sprintf('job-%d-%s', $jobId, bin2hex(random_bytes(6)));
    if (!mkdir($stagingPath, 0700)) {
        throw new RuntimeException("Unable to initialize staging for job {$jobId}.");
    }

    if (is_string($job['report_json']) && $job['report_json'] !== '') {
        $decoded = json_decode($job['report_json'], true);
        if (is_array($decoded)) {
            $report = $decoded;
        }
    }
    $report['phase'] = 'running';
    $report['claimed_at'] = gmdate(DATE_ATOM);
    $report['worker_pid'] = getmypid();

    $update = $pdo->prepare(
        "UPDATE template_import_jobs
         SET status = 'running',
             staging_path = :staging_path,
             report_json = :report_json,
             error_message = NULL,
             started_at = UTC_TIMESTAMP()
         WHERE id = :id AND status = 'queued'"
    );
    $update->execute([
        'staging_path' => $stagingPath,
        'report_json' => json_encode(
            $report,
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES
        ),
        'id' => $jobId,
    ]);
    if ($update->rowCount() !== 1) {
        throw new RuntimeException("Template import job {$jobId} claim was lost.", 409);
    }

    $pdo->commit();
    $claimed = true;

    $validator = new TemplateSourceValidator();
    $validation = $validator->validate((string) $job['source_url']);
    $report['phase'] = 'acquiring';
    $report['source_validation'] = [
        'final_url' => $validation['final_url'],
        'redirect_count' => count($validation['redirects']),
        'resolved_ips' => $validation['resolved_ips'],
    ];
    updateImportJob($pdo, $jobId, 'running', $report, null, 'running');

    $acquirer = new TemplateAcquirer();
    $acquisition = $acquirer->acquire(
        $validation['final_url'],
        $canonicalSlug,
        $stagingPath
    );
    $report['phase'] = 'scrubbing';
    $report['acquisition'] = [
        'file_count' => $acquisition['file_count'],
        'html_count' => $acquisition['html_count'],
        'bytes' => $acquisition['bytes'],
        'remote_hosts' => $acquisition['remote_hosts'],
        'duration_seconds' => $acquisition['duration_seconds'],
    ];
    updateImportJob($pdo, $jobId, 'scrubbing', $report, null, 'running');

    $scrubber = new TemplateScrubber();
    $scrub = $scrubber->scrubDirectory($acquisition['output_directory']);
    $report['phase'] = 'validating';
    $report['scrub'] = $scrub;
    updateImportJob($pdo, $jobId, 'validating', $report, null, 'scrubbing');

    $publishValidator = new TemplatePublishValidator();
    $publishValidation = $publishValidator->validate($acquisition['output_directory']);
    $assetProbe = (new TemplateAssetProbe())->probe($publishValidation['remote_assets']);
    $report['asset_manifest'] = [
        'local_files' => $publishValidation['files'],
        'local_bytes' => $publishValidation['bytes'],
        'remote_assets' => count($publishValidation['remote_assets']),
        'remote_hosts' => $acquisition['remote_hosts'],
    ];
    $report['asset_probe'] = $assetProbe;
    $report['publish_validation'] = [
        'html_files' => $publishValidation['html_files'],
        'files' => $publishValidation['files'],
        'bytes' => $publishValidation['bytes'],
        'remote_asset_count' => count($publishValidation['remote_assets']),
    ];
    $report['phase'] = 'ready';
    $report['ready_at'] = gmdate(DATE_ATOM);
    updateImportJob($pdo, $jobId, 'ready', $report, null, 'validating');

    fwrite(
        STDOUT,
        json_encode(
            [
                'id' => $jobId,
                'status' => 'ready',
                'slug' => $canonicalSlug,
                'file_count' => $acquisition['file_count'],
                'html_count' => $acquisition['html_count'],
                'scrub' => $scrub,
            ],
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES
        ) . PHP_EOL
    );
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if ($claimed && is_array($job)) {
        $report['phase'] = 'failed';
        $report['failed_at'] = gmdate(DATE_ATOM);
        try {
            updateImportJob(
                $pdo,
                $jobId,
                'failed',
                $report,
                mb_substr($e->getMessage(), 0, 2000),
                null
            );
        } catch (Throwable $updateError) {
            fwrite(STDERR, 'Unable to persist worker failure: ' . $updateError->getMessage() . PHP_EOL);
        }
    }
    if (is_string($stagingPath)) {
        removeStagingDirectory($stagingPath);
    }

    fwrite(STDERR, $e->getMessage() . PHP_EOL);
    $code = (int) $e->getCode();
    exit($code >= 400 && $code <= 499 ? 3 : 1);
}

/**
 * @param array<string, mixed> $report
 */
function updateImportJob(
    PDO $pdo,
    int $jobId,
    string $status,
    array $report,
    ?string $errorMessage,
    ?string $expectedStatus
): void {
    if (!TemplateImportPolicy::isKnownState($status)) {
        throw new InvalidArgumentException("Unknown import status: {$status}");
    }

    $sql = 'UPDATE template_import_jobs
            SET status = :status,
                report_json = :report_json,
                error_message = :error_message
            WHERE id = :id';
    $params = [
        'status' => $status,
        'report_json' => json_encode(
            $report,
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES
        ),
        'error_message' => $errorMessage,
        'id' => $jobId,
    ];
    if ($expectedStatus !== null) {
        $sql .= ' AND status = :expected_status';
        $params['expected_status'] = $expectedStatus;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    if ($stmt->rowCount() !== 1) {
        throw new RuntimeException(
            "Template import job {$jobId} could not transition to {$status}.",
            409
        );
    }
}

function removeStagingDirectory(string $path): void
{
    $root = realpath(TemplateImportPolicy::stagingRoot());
    $resolved = realpath($path);
    if ($root === false || $resolved === false) {
        return;
    }

    $prefix = rtrim($root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'job-';
    if (!str_starts_with($resolved, $prefix) || $resolved === $root) {
        return;
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($resolved, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($iterator as $entry) {
        if ($entry->isDir() && !$entry->isLink()) {
            @rmdir($entry->getPathname());
        } else {
            @unlink($entry->getPathname());
        }
    }
    @rmdir($resolved);
}
