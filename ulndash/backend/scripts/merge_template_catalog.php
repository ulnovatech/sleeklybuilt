<?php

declare(strict_types=1);

/**
 * Merge build-time catalog entries into the persistent runtime catalog.
 * Existing runtime entries win so UI/import edits survive deployments.
 */

require_once __DIR__ . '/../config/TemplateImportPolicy.php';

$buildPath = __DIR__ . '/../.catalog.build.json';
if (!is_file($buildPath)) {
    fwrite(STDERR, "Build catalog is missing.\n");
    exit(1);
}

$runtimePath = TemplateImportPolicy::catalogPath();
$lockPath = $runtimePath . '.lock';
$lock = fopen($lockPath, 'c+');
if ($lock === false || !flock($lock, LOCK_EX)) {
    fwrite(STDERR, "Unable to lock the runtime template catalog.\n");
    exit(1);
}

try {
    $build = json_decode(
        (string) file_get_contents($buildPath),
        true,
        512,
        JSON_THROW_ON_ERROR
    );
    $runtime = json_decode(
        (string) file_get_contents($runtimePath),
        true,
        512,
        JSON_THROW_ON_ERROR
    );
    if (!is_array($build) || !is_array($runtime)) {
        throw new RuntimeException('Template catalogs must be JSON objects.');
    }

    $merged = array_replace($build, $runtime);
    ksort($merged, SORT_NATURAL | SORT_FLAG_CASE);
    $json = json_encode(
        $merged,
        JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
    ) . PHP_EOL;

    $temporary = dirname($runtimePath) .
        DIRECTORY_SEPARATOR .
        '.catalog-deploy-' . bin2hex(random_bytes(6)) . '.tmp';
    if (file_put_contents($temporary, $json, LOCK_EX) === false) {
        throw new RuntimeException('Unable to write the merged template catalog.');
    }
    chmod($temporary, 0644);
    if (!rename($temporary, $runtimePath)) {
        @unlink($temporary);
        throw new RuntimeException('Unable to install the merged template catalog.');
    }
    @unlink($buildPath);

    fwrite(
        STDOUT,
        sprintf(
            "Template catalog merged: %d build, %d runtime, %d total.\n",
            count($build),
            count($runtime),
            count($merged)
        )
    );
} finally {
    flock($lock, LOCK_UN);
    fclose($lock);
}
