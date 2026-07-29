<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';
require_once __DIR__ . '/../services/TemplateImportLauncher.php';
require_once __DIR__ . '/../services/TemplatePublisher.php';
require_once __DIR__ . '/../services/TemplateAuditLogger.php';

final class TemplateImportController
{
    private const ACTIVE_STATES = [
        'queued',
        'running',
        'scrubbing',
        'validating',
        'ready',
    ];

    public function __construct(
        private PDO $pdo,
        private ?TemplateImportLauncher $launcher = null,
        private ?TemplatePublisher $publisher = null,
        private ?TemplateAuditLogger $audit = null
    ) {
        $this->publisher ??= new TemplatePublisher($this->pdo);
        $this->audit ??= new TemplateAuditLogger($this->pdo);
    }

    /**
     * @param array<string, mixed> $input
     * @param array<string, mixed>|null $user
     * @return array<string, mixed>
     */
    public function create(array $input, ?array $user): array
    {
        $sourceUrl = trim((string) ($input['source_url'] ?? ''));
        $slug = TemplateImportPolicy::folderIdFromSourceUrl($sourceUrl);
        if ($slug === null) {
            throw new InvalidArgumentException(
                'Source URL must be HTTPS on a valid *.webflow.io hostname.',
                422
            );
        }

        $title = $this->requiredText($input, 'title', 160);
        $category = $this->requiredText($input, 'category', 100);
        $description = $this->optionalText($input, 'description', 5000);
        $createdBy = TemplateAuditLogger::actor($user);

        $report = json_encode(
            [
                'phase' => 'queued',
                'source_host' => $slug,
                'queued_at' => gmdate(DATE_ATOM),
            ],
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES
        );

        $rateLock = $this->acquireRateLimitLock($createdBy);
        $jobId = 0;
        try {
            $this->assertWithinRateLimit($createdBy);
            $this->assertNoActiveImport($slug);

            $stmt = $this->pdo->prepare(
                'INSERT INTO template_import_jobs
                    (status, source_url, slug, title, description, category, report_json, created_by)
                 VALUES
                    (:status, :source_url, :slug, :title, :description, :category, :report_json, :created_by)'
            );
            try {
                $stmt->execute([
                    'status' => 'queued',
                    'source_url' => $sourceUrl,
                    'slug' => $slug,
                    'title' => $title,
                    'description' => $description,
                    'category' => $category,
                    'report_json' => $report,
                    'created_by' => $createdBy,
                ]);
                $jobId = (int) $this->pdo->lastInsertId();
            } catch (PDOException $e) {
                if ((int) ($e->errorInfo[1] ?? 0) === 1062) {
                    throw new RuntimeException(
                        "An active import for {$slug} already exists.",
                        409,
                        $e
                    );
                }
                throw $e;
            }
        } finally {
            $this->releaseRateLimitLock($rateLock);
        }

        if ($jobId < 1) {
            throw new RuntimeException('Template import job ID was not generated.');
        }
        if ($this->launcher !== null) {
            try {
                $this->launcher->launch($jobId);
            } catch (Throwable $e) {
                $failure = $this->pdo->prepare(
                    "UPDATE template_import_jobs
                     SET status = 'failed',
                         error_message = :error_message
                     WHERE id = :id AND status = 'queued'"
                );
                $failure->execute([
                    'error_message' => 'Worker launch failed: ' . mb_substr($e->getMessage(), 0, 1900),
                    'id' => $jobId,
                ]);
                $this->recordAudit(
                    'worker_launch_failed',
                    $createdBy,
                    $slug,
                    $jobId,
                    ['error_class' => get_class($e)]
                );
                throw new RuntimeException(
                    'Template import job was created but its worker could not start.',
                    503,
                    $e
                );
            }
        }
        $this->recordAudit('import_queued', $createdBy, $slug, $jobId, [
            'category' => $category,
        ]);

        return $this->findOrFail($jobId);
    }

    /**
     * @param array<string, mixed> $query
     * @return array{items: array<int, array<string, mixed>>, total: int}
     */
    public function index(array $query): array
    {
        $limit = min(max((int) ($query['limit'] ?? 50), 1), 100);
        $status = trim((string) ($query['status'] ?? ''));

        $where = '';
        $params = [];
        if ($status !== '') {
            if (!TemplateImportPolicy::isKnownState($status)) {
                throw new InvalidArgumentException('Unknown template import status.', 422);
            }
            $where = ' WHERE status = :status';
            $params['status'] = $status;
        }

        $countStmt = $this->pdo->prepare('SELECT COUNT(*) FROM template_import_jobs' . $where);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $this->pdo->prepare(
            'SELECT * FROM template_import_jobs' .
            $where .
            ' ORDER BY id DESC LIMIT ' .
            $limit
        );
        $stmt->execute($params);

        return [
            'items' => array_map(
                fn (array $row): array => $this->serializeRow($row),
                $stmt->fetchAll()
            ),
            'total' => $total,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function show(int $id): array
    {
        if ($id < 1) {
            throw new InvalidArgumentException('Invalid template import job ID.', 422);
        }

        return $this->findOrFail($id);
    }

    /**
     * @return array<string, mixed>
     */
    public function publish(int $id, bool $force, ?array $user): array
    {
        $actor = TemplateAuditLogger::actor($user);
        $result = $this->publisher->publish($id, $force);
        $this->recordAudit(
            $result['replaced_existing'] ? 'template_replaced' : 'template_published',
            $actor,
            (string) $result['slug'],
            $id,
            ['force' => $force]
        );

        return $result;
    }

    /**
     * @return array{id:int,status:string}
     */
    public function discard(int $id, ?array $user): array
    {
        $actor = TemplateAuditLogger::actor($user);
        $job = $this->findOrFail($id);
        $result = $this->publisher->discard($id);
        $this->recordAudit('import_discarded', $actor, (string) $job['slug'], $id);

        return $result;
    }

    /**
     * @return array{id:int,status:string,slug:string,entry:?string}
     */
    public function rollback(int $id, ?array $user): array
    {
        $actor = TemplateAuditLogger::actor($user);
        $result = $this->publisher->rollback($id);
        $this->recordAudit('template_rolled_back', $actor, (string) $result['slug'], $id);

        return $result;
    }

    public function servePreview(int $id, string $relativePath): never
    {
        $stmt = $this->pdo->prepare(
            "SELECT status, staging_path
             FROM template_import_jobs
             WHERE id = :id"
        );
        $stmt->execute(['id' => $id]);
        $job = $stmt->fetch();
        if (!is_array($job)) {
            throw new RuntimeException('Template import job not found.', 404);
        }
        if ($job['status'] !== 'ready') {
            throw new RuntimeException('Preview is available only for ready imports.', 409);
        }

        $stagingRoot = realpath(TemplateImportPolicy::stagingRoot());
        $stagingPath = realpath((string) $job['staging_path']);
        if ($stagingRoot === false || $stagingPath === false) {
            throw new RuntimeException('Template preview staging is unavailable.', 404);
        }
        $jobPrefix = rtrim($stagingRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'job-';
        if (!str_starts_with($stagingPath, $jobPrefix)) {
            throw new RuntimeException('Template preview path failed containment validation.', 422);
        }

        $siteRoot = realpath($stagingPath . DIRECTORY_SEPARATOR . 'site');
        if ($siteRoot === false) {
            throw new RuntimeException('Template preview site is unavailable.', 404);
        }

        $relativePath = rawurldecode($relativePath);
        if ($relativePath === '' || str_ends_with($relativePath, '/')) {
            $relativePath .= 'index.html';
        }
        if (
            str_contains($relativePath, "\0") ||
            str_contains($relativePath, '..') ||
            str_starts_with($relativePath, '/') ||
            str_starts_with($relativePath, '\\')
        ) {
            throw new InvalidArgumentException('Invalid template preview path.', 422);
        }

        $file = realpath(
            $siteRoot . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath)
        );
        $sitePrefix = rtrim($siteRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        if (
            $file === false ||
            !str_starts_with($file, $sitePrefix) ||
            !is_file($file)
        ) {
            throw new RuntimeException('Template preview file not found.', 404);
        }

        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $types = [
            'html' => 'text/html; charset=utf-8',
            'htm' => 'text/html; charset=utf-8',
            'css' => 'text/css; charset=utf-8',
            'js' => 'application/javascript; charset=utf-8',
            'json' => 'application/json; charset=utf-8',
            'svg' => 'image/svg+xml',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
        ];
        if (!isset($types[$extension])) {
            throw new RuntimeException('Template preview file type is not allowed.', 415);
        }

        header('Content-Type: ' . $types[$extension]);
        header('Cache-Control: private, no-store');
        header('X-Content-Type-Options: nosniff');
        if ($extension === 'html' || $extension === 'htm') {
            header(
                "Content-Security-Policy: sandbox allow-scripts allow-forms; " .
                "default-src 'self' https: data: blob:; " .
                "script-src 'self' https: 'unsafe-inline' 'unsafe-eval'; " .
                "style-src 'self' https: 'unsafe-inline'; " .
                "img-src 'self' https: data: blob:; font-src 'self' https: data:;"
            );
        }
        readfile($file);
        exit;
    }

    private function assertNoActiveImport(string $slug): void
    {
        $placeholders = implode(',', array_fill(0, count(self::ACTIVE_STATES), '?'));
        $stmt = $this->pdo->prepare(
            "SELECT id FROM template_import_jobs
             WHERE slug = ? AND status IN ({$placeholders})
             ORDER BY id DESC LIMIT 1"
        );
        $stmt->execute(array_merge([$slug], self::ACTIVE_STATES));

        $existingId = $stmt->fetchColumn();
        if ($existingId !== false) {
            throw new RuntimeException(
                "An active import for {$slug} already exists (job {$existingId}).",
                409
            );
        }
    }

    private function assertWithinRateLimit(string $actor): void
    {
        $configured = filter_var(
            getenv('TEMPLATE_IMPORT_MAX_PER_HOUR') ?: '6',
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1, 'max_range' => 100]]
        );
        $limit = $configured === false ? 6 : (int) $configured;
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*)
             FROM template_import_jobs
             WHERE created_by = :created_by
               AND created_at >= UTC_TIMESTAMP() - INTERVAL 1 HOUR'
        );
        $stmt->execute(['created_by' => $actor]);
        if ((int) $stmt->fetchColumn() >= $limit) {
            throw new RuntimeException(
                "Import limit reached ({$limit} per hour). Try again later.",
                429
            );
        }
    }

    private function acquireRateLimitLock(string $actor): string
    {
        $lockName = 'template-rate:' . substr(hash('sha256', $actor), 0, 40);
        $stmt = $this->pdo->prepare('SELECT GET_LOCK(:lock_name, 5)');
        $stmt->execute(['lock_name' => $lockName]);
        if ((int) $stmt->fetchColumn() !== 1) {
            throw new RuntimeException('Unable to reserve an import slot. Try again.', 503);
        }

        return $lockName;
    }

    private function releaseRateLimitLock(string $lockName): void
    {
        try {
            $stmt = $this->pdo->prepare('SELECT RELEASE_LOCK(:lock_name)');
            $stmt->execute(['lock_name' => $lockName]);
        } catch (Throwable $e) {
            error_log('Unable to release template import rate lock: ' . $e->getMessage());
        }
    }

    /**
     * @param array<string,mixed> $details
     */
    private function recordAudit(
        string $action,
        string $actor,
        string $slug,
        ?int $jobId,
        array $details = []
    ): void {
        try {
            $this->audit?->log($action, $actor, $slug, $jobId, $details);
        } catch (Throwable $e) {
            error_log("Template audit event {$action} failed: " . $e->getMessage());
        }
    }

    /**
     * @param array<string, mixed> $input
     */
    private function requiredText(array $input, string $key, int $maxLength): string
    {
        $value = trim((string) ($input[$key] ?? ''));
        if ($value === '') {
            throw new InvalidArgumentException(
                ucfirst(str_replace('_', ' ', $key)) . ' is required.',
                422
            );
        }
        if (mb_strlen($value) > $maxLength) {
            throw new InvalidArgumentException(
                ucfirst(str_replace('_', ' ', $key)) . " must be {$maxLength} characters or fewer.",
                422
            );
        }

        return $value;
    }

    /**
     * @param array<string, mixed> $input
     */
    private function optionalText(array $input, string $key, int $maxLength): ?string
    {
        $value = trim((string) ($input[$key] ?? ''));
        if ($value === '') {
            return null;
        }
        if (mb_strlen($value) > $maxLength) {
            throw new InvalidArgumentException(
                ucfirst(str_replace('_', ' ', $key)) . " must be {$maxLength} characters or fewer.",
                422
            );
        }

        return $value;
    }

    /**
     * @return array<string, mixed>
     */
    private function findOrFail(int $id): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM template_import_jobs WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if (!is_array($row)) {
            throw new RuntimeException('Template import job not found.', 404);
        }

        return $this->serializeRow($row);
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function serializeRow(array $row): array
    {
        $report = null;
        if (is_string($row['report_json'] ?? null) && $row['report_json'] !== '') {
            $decoded = json_decode($row['report_json'], true);
            $report = is_array($decoded) ? $decoded : null;
        }

        return [
            'id' => (int) $row['id'],
            'status' => (string) $row['status'],
            'source_url' => (string) $row['source_url'],
            'slug' => (string) $row['slug'],
            'title' => (string) $row['title'],
            'description' => $row['description'],
            'category' => (string) $row['category'],
            'report' => $report,
            'error_message' => $row['error_message'],
            'created_by' => (string) $row['created_by'],
            'created_at' => (string) $row['created_at'],
            'updated_at' => (string) $row['updated_at'],
            'started_at' => $row['started_at'],
            'published_at' => $row['published_at'],
            'preview_url' => $row['status'] === 'ready'
                ? '/api/template-imports/' . (int) $row['id'] . '/preview/'
                : null,
        ];
    }
}
