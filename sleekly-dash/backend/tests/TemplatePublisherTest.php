<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../php/env.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../services/TemplatePublisher.php';

$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'sleeklybuilt';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$pdo = new PDO(
    sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName),
    $user,
    $pass,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

$token = bin2hex(random_bytes(5));
$slug = "publish-{$token}.webflow.io";
$discardSlug = "discard-{$token}.webflow.io";
$portfolioDirectory = TemplateImportPolicy::portfolioDirectory();
$catalogPath = TemplateImportPolicy::catalogPath();
$catalogOriginal = (string) file_get_contents($catalogPath);
$jobIds = [];
$stagingPaths = [];

try {
    $publisher = new TemplatePublisher($pdo);

    $first = createPublishFixture($pdo, $slug, 'First published version', false);
    $jobIds[] = $first['job_id'];
    $stagingPaths[] = $first['staging_path'];
    $result = $publisher->publish($first['job_id']);

    if (
        $result['status'] !== 'published' ||
        !is_file($portfolioDirectory . "/{$slug}/index.html")
    ) {
        throw new RuntimeException('Initial template publish did not install the site.');
    }
    $catalog = json_decode((string) file_get_contents($catalogPath), true, 512, JSON_THROW_ON_ERROR);
    if (($catalog[$slug]['title'] ?? null) !== 'First published version') {
        throw new RuntimeException('Initial template publish did not update the catalog.');
    }
    $reportStmt = $pdo->prepare(
        'SELECT report_json FROM template_import_jobs WHERE id = :id'
    );
    $reportStmt->execute(['id' => $first['job_id']]);
    $publishedReport = json_decode(
        (string) $reportStmt->fetchColumn(),
        true,
        512,
        JSON_THROW_ON_ERROR
    );
    if (($publishedReport['asset_probe']['checked'] ?? 0) !== 1) {
        throw new RuntimeException('Publish did not probe the staged remote asset.');
    }

    $replacement = createPublishFixture($pdo, $slug, 'Replacement version', false);
    $jobIds[] = $replacement['job_id'];
    $stagingPaths[] = $replacement['staging_path'];
    try {
        $publisher->publish($replacement['job_id']);
        throw new RuntimeException('Publish collision was accepted without force.');
    } catch (RuntimeException $e) {
        if ($e->getCode() !== 409) {
            throw $e;
        }
    }
    if (!is_dir($replacement['staging_path'])) {
        throw new RuntimeException('Collision removed the replacement staging directory.');
    }

    $replacementResult = $publisher->publish($replacement['job_id'], true);
    if (($replacementResult['replaced_existing'] ?? false) !== true) {
        throw new RuntimeException('Forced publish did not report a replacement.');
    }
    $liveHtml = (string) file_get_contents($portfolioDirectory . "/{$slug}/index.html");
    if (!str_contains($liveHtml, 'Replacement version')) {
        throw new RuntimeException('Forced publish did not install replacement content.');
    }
    $backups = glob($portfolioDirectory . "/.backup-{$slug}-*", GLOB_ONLYDIR) ?: [];
    if (count($backups) !== 1) {
        throw new RuntimeException('Forced publish did not retain exactly one rollback backup.');
    }

    $rollbackResult = $publisher->rollback($replacement['job_id']);
    if (
        $rollbackResult['status'] !== 'rolled_back' ||
        $rollbackResult['entry'] === null
    ) {
        throw new RuntimeException('Replacement rollback did not restore the previous template.');
    }
    $restoredHtml = (string) file_get_contents($portfolioDirectory . "/{$slug}/index.html");
    $restoredCatalog = json_decode(
        (string) file_get_contents($catalogPath),
        true,
        512,
        JSON_THROW_ON_ERROR
    );
    if (
        !str_contains($restoredHtml, 'First published version') ||
        ($restoredCatalog[$slug]['title'] ?? null) !== 'First published version'
    ) {
        throw new RuntimeException('Rollback did not restore folder and catalog metadata together.');
    }

    $invalid = createPublishFixture($pdo, "invalid-{$token}.webflow.io", 'Invalid', true);
    $jobIds[] = $invalid['job_id'];
    $stagingPaths[] = $invalid['staging_path'];
    try {
        $publisher->publish($invalid['job_id']);
        throw new RuntimeException('Seller-contaminated HTML passed the publish gate.');
    } catch (RuntimeException $e) {
        if ($e->getCode() !== 422) {
            throw $e;
        }
    }

    $discard = createPublishFixture($pdo, $discardSlug, 'Discard fixture', false);
    $jobIds[] = $discard['job_id'];
    $stagingPaths[] = $discard['staging_path'];
    $discardResult = $publisher->discard($discard['job_id']);
    if (
        $discardResult['status'] !== 'discarded' ||
        is_dir($discard['staging_path'])
    ) {
        throw new RuntimeException('Discard did not remove private staging.');
    }

    fwrite(STDOUT, "Template publish, replacement, validation, and discard passed.\n");
} finally {
    $incomingPaths = [];
    foreach ($jobIds as $jobId) {
        $incomingPaths = array_merge(
            $incomingPaths,
            glob($portfolioDirectory . "/.incoming-{$jobId}-*", GLOB_ONLYDIR) ?: []
        );
    }
    foreach (array_merge(
        [$portfolioDirectory . "/{$slug}"],
        glob($portfolioDirectory . "/.backup-{$slug}-*", GLOB_ONLYDIR) ?: [],
        $incomingPaths,
        $stagingPaths
    ) as $path) {
        removePublishFixtureDirectory($path);
    }

    $lock = fopen($catalogPath . '.lock', 'c+');
    if ($lock !== false && flock($lock, LOCK_EX)) {
        $temporary = dirname($catalogPath) . '/.catalog-test-' . bin2hex(random_bytes(4));
        file_put_contents($temporary, $catalogOriginal, LOCK_EX);
        rename($temporary, $catalogPath);
        flock($lock, LOCK_UN);
        fclose($lock);
    }

    if ($jobIds !== []) {
        $placeholders = implode(',', array_fill(0, count($jobIds), '?'));
        $cleanup = $pdo->prepare(
            "DELETE FROM template_import_jobs
             WHERE id IN ({$placeholders})
               AND created_by = '_template_publisher_test'"
        );
        $cleanup->execute($jobIds);
    }
}

/**
 * @return array{job_id:int,staging_path:string}
 */
function createPublishFixture(
    PDO $pdo,
    string $slug,
    string $title,
    bool $withSeller
): array {
    $stagingRoot = TemplateImportPolicy::stagingRoot();
    if (!is_dir($stagingRoot)) {
        if (!mkdir($stagingRoot, 0700, true) && !is_dir($stagingRoot)) {
            throw new RuntimeException('Unable to create publisher test staging root.');
        }
    }
    $stagingPath = $stagingRoot . '/job-fixture-' . bin2hex(random_bytes(6));
    $site = $stagingPath . '/site';
    if (!mkdir($site . '/nested', 0700, true) && !is_dir($site . '/nested')) {
        throw new RuntimeException('Unable to create publisher test staging fixture.');
    }

    $seller = $withSeller
        ? '<div class="hireus-badge-wrapper">Purchase Website</div>'
        : '';
    $page = static fn (string $heading): string =>
        '<!doctype html><html><head><title>' . htmlspecialchars($heading) .
        '</title></head><body><h1>' . htmlspecialchars($heading) . '</h1>' .
        $seller .
        '<img src="https://cdn.prod.website-files.com/660795973dfa1f4a6cfcaed4/' .
        '660bace3339b1e206cd07b15_Line.svg" alt="">' .
        '<script src="/portfolio/portfolio/cta.js" defer></script></body></html>';
    if (
        file_put_contents($site . '/index.html', $page($title)) === false ||
        file_put_contents($site . '/nested/about.html', $page($title . ' About')) === false
    ) {
        throw new RuntimeException('Unable to write publisher test staging fixture.');
    }

    $stmt = $pdo->prepare(
        "INSERT INTO template_import_jobs
            (status, source_url, slug, title, description, category,
             staging_path, report_json, created_by, started_at)
         VALUES
            ('ready', :source_url, :slug, :title, :description, 'test',
             :staging_path, :report_json, '_template_publisher_test', UTC_TIMESTAMP())"
    );
    $stmt->execute([
        'source_url' => "https://{$slug}/",
        'slug' => $slug,
        'title' => $title,
        'description' => 'Publisher integration fixture.',
        'staging_path' => $stagingPath,
        'report_json' => '{"phase":"ready"}',
    ]);

    return [
        'job_id' => (int) $pdo->lastInsertId(),
        'staging_path' => $stagingPath,
    ];
}

function removePublishFixtureDirectory(string $path): void
{
    if (!is_dir($path) || is_link($path)) {
        return;
    }
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
