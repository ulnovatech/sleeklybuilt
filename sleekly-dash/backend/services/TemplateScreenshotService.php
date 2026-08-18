<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';
require_once __DIR__ . '/TemplateScreenshotPageSelector.php';
require_once __DIR__ . '/TemplateScreenshotLauncher.php';

/**
 * Queue and persist gallery screenshot capture for published templates.
 */
final class TemplateScreenshotService
{
    public function __construct(
        private PDO $pdo,
        private ?TemplateScreenshotPageSelector $selector = null,
        private ?TemplateScreenshotLauncher $launcher = null,
    ) {
        $this->selector ??= new TemplateScreenshotPageSelector();
        $this->launcher ??= new TemplateScreenshotLauncher();
    }

    /**
     * @return array<string, mixed>
     */
    public function enqueue(int $jobId, bool $force = false): array
    {
        $job = $this->lockPublishedJob($jobId);
        $report = $this->decodeReport($job['report_json'] ?? null);
        $existing = is_array($report['screenshots'] ?? null) ? $report['screenshots'] : [];
        $status = (string) ($existing['status'] ?? '');

        if (!$force && in_array($status, ['queued', 'running'], true)) {
            return $this->serializeJob($jobId);
        }

        $report['screenshots'] = [
            'status' => 'queued',
            'queued_at' => gmdate(DATE_ATOM),
            'started_at' => null,
            'finished_at' => null,
            'main' => 'images/main.png',
            'files' => [],
            'pages' => [],
            'skipped' => [],
            'error' => null,
            'force' => $force,
        ];

        $this->writeReport((int) $job['id'], $report);
        try {
            $this->launcher->launch((int) $job['id']);
        } catch (Throwable $e) {
            $report['screenshots']['status'] = 'failed';
            $report['screenshots']['finished_at'] = gmdate(DATE_ATOM);
            $report['screenshots']['error'] = $e->getMessage();
            $this->writeReport((int) $job['id'], $report);
            throw $e;
        }

        return $this->serializeJob($jobId);
    }

    public function run(int $jobId): void
    {
        $job = $this->lockPublishedJob($jobId);
        $report = $this->decodeReport($job['report_json'] ?? null);
        $shots = is_array($report['screenshots'] ?? null) ? $report['screenshots'] : [];
        $shots['status'] = 'running';
        $shots['started_at'] = gmdate(DATE_ATOM);
        $shots['error'] = null;
        $report['screenshots'] = $shots;
        $this->writeReport($jobId, $report);

        try {
            $slug = (string) $job['slug'];
            $siteRoot = TemplateImportPolicy::portfolioDirectory() . DIRECTORY_SEPARATOR . $slug;
            if (!is_dir($siteRoot)) {
                throw new RuntimeException("Published template directory missing: {$slug}");
            }

            $pages = $this->selector->select($siteRoot);
            $imagesDir = $siteRoot . DIRECTORY_SEPARATOR . 'images';
            if (!is_dir($imagesDir) && !mkdir($imagesDir, 0755, true) && !is_dir($imagesDir)) {
                throw new RuntimeException('Unable to create images directory for screenshots.');
            }

            $this->cleanupPreviousCaptures($imagesDir, is_array($shots['files'] ?? null) ? $shots['files'] : []);

            $baseUrl = $this->resolveBaseUrl($slug);
            $result = $this->launcher->capture($slug, $siteRoot, $baseUrl, $pages);

            $files = [];
            foreach ($pages as $page) {
                $relative = 'images/' . $page['filename'];
                $absolute = $imagesDir . DIRECTORY_SEPARATOR . $page['filename'];
                if (is_file($absolute)) {
                    $files[] = $relative;
                }
            }

            if ($files === [] || !is_file($imagesDir . DIRECTORY_SEPARATOR . 'main.png')) {
                throw new RuntimeException(
                    'Screenshot capture finished without main.png. '
                    . trim((string) ($result['error'] ?? 'Chromium/Node may be unavailable.'))
                );
            }

            $report['screenshots'] = [
                'status' => 'ready',
                'queued_at' => $shots['queued_at'] ?? null,
                'started_at' => $shots['started_at'],
                'finished_at' => gmdate(DATE_ATOM),
                'main' => 'images/main.png',
                'files' => $files,
                'pages' => $pages,
                'skipped' => $result['skipped'] ?? [],
                'error' => null,
                'base_url' => $baseUrl,
                'engine' => $result['engine'] ?? 'puppeteer',
            ];
            $this->writeReport($jobId, $report);
        } catch (Throwable $e) {
            $report['screenshots'] = [
                'status' => 'failed',
                'queued_at' => $shots['queued_at'] ?? null,
                'started_at' => $shots['started_at'] ?? gmdate(DATE_ATOM),
                'finished_at' => gmdate(DATE_ATOM),
                'main' => 'images/main.png',
                'files' => [],
                'pages' => [],
                'skipped' => [],
                'error' => $e->getMessage(),
            ];
            $this->writeReport($jobId, $report);
            throw $e;
        }
    }

    private function resolveBaseUrl(string $slug): string
    {
        $configured = trim((string) (getenv('TEMPLATE_SCREENSHOT_BASE_URL') ?: getenv('BASE_URL') ?: ''));
        if ($configured !== '') {
            return rtrim($configured, '/') . '/portfolio/portfolio/' . rawurlencode($slug) . '/';
        }

        // file:// directory fallback — remote CDN assets may still load when network is available.
        $siteRoot = TemplateImportPolicy::portfolioDirectory() . DIRECTORY_SEPARATOR . $slug;
        $normalized = str_replace(DIRECTORY_SEPARATOR, '/', $siteRoot);
        if (preg_match('#^[A-Za-z]:/#', $normalized) === 1) {
            return 'file:///' . $normalized . '/';
        }
        return 'file://' . $normalized . '/';
    }

    /**
     * @param list<string> $previousFiles
     */
    private function cleanupPreviousCaptures(string $imagesDir, array $previousFiles): void
    {
        foreach ($previousFiles as $relative) {
            $name = basename((string) $relative);
            if ($name === '' || $name === '.' || $name === '..') {
                continue;
            }
            $path = $imagesDir . DIRECTORY_SEPARATOR . $name;
            if (is_file($path)) {
                @unlink($path);
            }
        }

        foreach (glob($imagesDir . DIRECTORY_SEPARATOR . 'Screenshot*.png') ?: [] as $noise) {
            @unlink($noise);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function lockPublishedJob(int $jobId): array
    {
        if ($jobId < 1) {
            throw new InvalidArgumentException('Invalid template import job ID.', 422);
        }

        $stmt = $this->pdo->prepare(
            "SELECT id, status, slug, report_json
             FROM template_import_jobs
             WHERE id = :id
             LIMIT 1"
        );
        $stmt->execute(['id' => $jobId]);
        $job = $stmt->fetch();
        if (!is_array($job)) {
            throw new RuntimeException('Template import job not found.', 404);
        }
        if (($job['status'] ?? '') !== 'published') {
            throw new RuntimeException('Screenshots are available only after publish.', 409);
        }

        return $job;
    }

    /**
     * @param mixed $json
     * @return array<string, mixed>
     */
    private function decodeReport(mixed $json): array
    {
        if (!is_string($json) || $json === '') {
            return [];
        }
        $decoded = json_decode($json, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @param array<string, mixed> $report
     */
    private function writeReport(int $jobId, array $report): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE template_import_jobs
             SET report_json = :report_json, updated_at = UTC_TIMESTAMP()
             WHERE id = :id AND status = \'published\''
        );
        $stmt->execute([
            'report_json' => json_encode($report, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
            'id' => $jobId,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeJob(int $jobId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM template_import_jobs WHERE id = :id');
        $stmt->execute(['id' => $jobId]);
        $row = $stmt->fetch();
        if (!is_array($row)) {
            throw new RuntimeException('Template import job not found.', 404);
        }

        $report = $this->decodeReport($row['report_json'] ?? null);
        return [
            'id' => (int) $row['id'],
            'status' => (string) $row['status'],
            'slug' => (string) $row['slug'],
            'title' => (string) $row['title'],
            'report' => $report,
            'screenshots' => $report['screenshots'] ?? null,
        ];
    }
}
