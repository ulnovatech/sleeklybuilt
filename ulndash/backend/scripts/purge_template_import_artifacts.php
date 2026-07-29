<?php

declare(strict_types=1);

/**
 * Remove unreferenced staging directories and old worker logs.
 *
 * Usage:
 *   php scripts/purge_template_import_artifacts.php [--dry-run]
 */

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../config/TemplateImportPolicy.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This maintenance script is CLI-only.\n");
    exit(1);
}

$dryRun = in_array('--dry-run', $argv, true);
$stagingDays = boundedDays('TEMPLATE_IMPORT_STAGING_RETENTION_DAYS', 7);
$logDays = boundedDays('TEMPLATE_IMPORT_LOG_RETENTION_DAYS', 30);
$now = time();

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

$active = $pdo->query(
    "SELECT staging_path
     FROM template_import_jobs
     WHERE status IN ('queued', 'running', 'scrubbing', 'validating', 'ready')
       AND staging_path IS NOT NULL"
)->fetchAll(PDO::FETCH_COLUMN);
$activePaths = [];
foreach ($active as $path) {
    $normalized = normalizePath((string) $path);
    if ($normalized !== '') {
        $activePaths[$normalized] = true;
    }
}

$removedDirectories = 0;
$removedLogs = 0;
$removedDrafts = 0;
$reclaimedBytes = 0;
$root = TemplateImportPolicy::stagingRoot();
if (is_dir($root) && !is_link($root)) {
    foreach (scandir($root) ?: [] as $name) {
        if (preg_match('/\Ajob-\d+-[a-f0-9]{12}\z/D', $name) !== 1) {
            continue;
        }
        $path = $root . DIRECTORY_SEPARATOR . $name;
        if (
            !is_dir($path) ||
            is_link($path) ||
            isset($activePaths[normalizePath($path)]) ||
            (int) filemtime($path) >= $now - ($stagingDays * 86400)
        ) {
            continue;
        }
        $bytes = directoryBytes($path);
        if (!$dryRun) {
            removeDirectory($path, $root);
        }
        $removedDirectories++;
        $reclaimedBytes += $bytes;
    }
}

$logDirectory = TemplateImportPolicy::logDirectory();
if (is_dir($logDirectory) && !is_link($logDirectory)) {
    foreach (scandir($logDirectory) ?: [] as $name) {
        if (preg_match('/\Ajob-\d+\.log\z/D', $name) !== 1) {
            continue;
        }
        $path = $logDirectory . DIRECTORY_SEPARATOR . $name;
        if (
            !is_file($path) ||
            is_link($path) ||
            (int) filemtime($path) >= $now - ($logDays * 86400)
        ) {
            continue;
        }
        $bytes = (int) filesize($path);
        if (!$dryRun && !unlink($path)) {
            throw new RuntimeException("Unable to remove worker log: {$name}");
        }
        $removedLogs++;
        $reclaimedBytes += $bytes;
    }
}

$draftRoot = TemplateImportPolicy::profileRoot() . DIRECTORY_SEPARATOR . 'drafts';
if (is_dir($draftRoot) && !is_link($draftRoot)) {
    foreach (scandir($draftRoot) ?: [] as $name) {
        if (preg_match('/\A[a-f0-9]{48}\z/D', $name) !== 1) {
            continue;
        }
        $path = $draftRoot . DIRECTORY_SEPARATOR . $name;
        if (!is_dir($path) || is_link($path)) {
            continue;
        }
        $expires = 0;
        $metadataPath = $path . DIRECTORY_SEPARATOR . 'draft.json';
        if (is_file($metadataPath)) {
            $metadata = json_decode((string) file_get_contents($metadataPath), true);
            $expires = (int) ($metadata['expires_unix'] ?? 0);
        }
        if ($expires >= $now || ($expires === 0 && (int) filemtime($path) >= $now - 86400)) {
            continue;
        }
        $bytes = directoryBytes($path);
        if (!$dryRun) {
            removeProfileDraft($path, $draftRoot);
        }
        $removedDrafts++;
        $reclaimedBytes += $bytes;
    }
}

fwrite(STDOUT, json_encode([
    'dry_run' => $dryRun,
    'staging_retention_days' => $stagingDays,
    'log_retention_days' => $logDays,
    'directories_removed' => $removedDirectories,
    'logs_removed' => $removedLogs,
    'drafts_removed' => $removedDrafts,
    'bytes_reclaimed' => $reclaimedBytes,
    'completed_at' => gmdate(DATE_ATOM),
], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES) . PHP_EOL);

function boundedDays(string $name, int $default): int
{
    $value = filter_var(
        getenv($name) ?: (string) $default,
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1, 'max_range' => 365]]
    );

    return $value === false ? $default : (int) $value;
}

function normalizePath(string $path): string
{
    $resolved = realpath($path);
    $value = $resolved !== false ? $resolved : $path;

    return PHP_OS_FAMILY === 'Windows'
        ? strtolower(rtrim(str_replace('\\', '/', $value), '/'))
        : rtrim($value, '/');
}

function directoryBytes(string $path): int
{
    $bytes = 0;
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)
    );
    foreach ($iterator as $entry) {
        if ($entry->isFile() && !$entry->isLink()) {
            $bytes += $entry->getSize();
        }
    }

    return $bytes;
}

function removeDirectory(string $path, string $root): void
{
    $resolvedRoot = realpath($root);
    $resolvedPath = realpath($path);
    if (
        $resolvedRoot === false ||
        $resolvedPath === false ||
        is_link($resolvedPath) ||
        !str_starts_with(
            $resolvedPath,
            rtrim($resolvedRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'job-'
        )
    ) {
        throw new RuntimeException('Refusing to remove a path outside template staging.');
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($resolvedPath, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($iterator as $entry) {
        if ($entry->isDir() && !$entry->isLink()) {
            if (!rmdir($entry->getPathname())) {
                throw new RuntimeException('Unable to remove a staged directory.');
            }
        } elseif (!unlink($entry->getPathname())) {
            throw new RuntimeException('Unable to remove a staged file.');
        }
    }
    if (!rmdir($resolvedPath)) {
        throw new RuntimeException('Unable to remove an abandoned staging directory.');
    }
}

function removeProfileDraft(string $path, string $draftRoot): void
{
    $resolvedRoot = realpath($draftRoot);
    $resolvedPath = realpath($path);
    if (
        $resolvedRoot === false ||
        $resolvedPath === false ||
        is_link($resolvedPath) ||
        !str_starts_with(
            $resolvedPath,
            rtrim($resolvedRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR
        ) ||
        preg_match('/\A[a-f0-9]{48}\z/D', basename($resolvedPath)) !== 1
    ) {
        throw new RuntimeException('Refusing to remove a path outside content draft storage.');
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($resolvedPath, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($iterator as $entry) {
        if ($entry->isDir() && !$entry->isLink()) {
            if (!rmdir($entry->getPathname())) {
                throw new RuntimeException('Unable to remove a content draft directory.');
            }
        } elseif (!unlink($entry->getPathname())) {
            throw new RuntimeException('Unable to remove a content draft file.');
        }
    }
    if (!rmdir($resolvedPath)) {
        throw new RuntimeException('Unable to remove expired content draft.');
    }
}
