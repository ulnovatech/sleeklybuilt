<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';
require_once __DIR__ . '/TemplatePublishValidator.php';
require_once __DIR__ . '/TemplateAssetProbe.php';
require_once __DIR__ . '/TemplateSectionEditor.php';

final class TemplatePublisher
{
    public function __construct(
        private PDO $pdo,
        private ?TemplatePublishValidator $validator = null,
        private ?TemplateAssetProbe $assetProbe = null,
        private ?TemplateSectionEditor $sectionEditor = null
    ) {
        $this->validator ??= new TemplatePublishValidator();
        $this->assetProbe ??= new TemplateAssetProbe();
        $this->sectionEditor ??= new TemplateSectionEditor();
    }

    /**
     * @return array<string, mixed>
     */
    public function publish(int $jobId, bool $force = false): array
    {
        $job = $this->loadJob($jobId);
        if ($job['status'] !== 'ready') {
            throw new RuntimeException('Only a ready template import can be published.', 409);
        }

        $stagingPath = $this->validatedStagingPath((string) $job['staging_path']);
        $siteDirectory = $stagingPath . DIRECTORY_SEPARATOR . 'site';
        $validation = $this->validator->validate($siteDirectory);
        $assetProbe = $this->assetProbe->probe($validation['remote_assets']);
        $validationReport = $validation;
        $validationReport['remote_asset_count'] = count($validation['remote_assets']);
        unset($validationReport['remote_assets']);
        $portfolioDirectory = TemplateImportPolicy::portfolioDirectory();
        $slug = (string) $job['slug'];
        $destination = $portfolioDirectory . DIRECTORY_SEPARATOR . $slug;
        $incoming = $portfolioDirectory .
            DIRECTORY_SEPARATOR .
            '.incoming-' . $jobId . '-' . bin2hex(random_bytes(5));

        $this->copyDirectory($siteDirectory, $incoming);
        $this->validator->validate($incoming);

        $catalogPath = TemplateImportPolicy::catalogPath();
        $lockPath = $catalogPath . '.lock';
        $lock = fopen($lockPath, 'c+');
        if ($lock === false || !flock($lock, LOCK_EX)) {
            $this->removeDirectory($incoming);
            throw new RuntimeException('Unable to acquire the template catalog lock.', 503);
        }

        $backup = null;
        $catalogOriginal = null;
        $catalogChanged = false;
        $destinationInstalled = false;

        try {
            clearstatcache(true, $destination);
            if (file_exists($destination) && !$force) {
                throw new RuntimeException(
                    "Template {$slug} already exists; force confirmation is required.",
                    409
                );
            }

            $catalogOriginal = file_get_contents($catalogPath);
            if (!is_string($catalogOriginal)) {
                throw new RuntimeException('Unable to read the template catalog.');
            }
            $catalog = json_decode($catalogOriginal, true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($catalog)) {
                throw new RuntimeException('Template catalog is not a JSON object.');
            }
            $previousCatalogEntry = $catalog[$slug] ?? null;

            $this->pdo->beginTransaction();
            $lockedJob = $this->lockReadyJob($jobId);

            if (file_exists($destination)) {
                $backup = $portfolioDirectory .
                    DIRECTORY_SEPARATOR .
                    '.backup-' . $slug . '-' . gmdate('YmdHis');
                if (!rename($destination, $backup)) {
                    throw new RuntimeException('Unable to back up the existing template.');
                }
            }
            if (!rename($incoming, $destination)) {
                throw new RuntimeException('Unable to atomically install the template.');
            }
            $destinationInstalled = true;

            $previousAliases = [];
            if (is_array($previousCatalogEntry) && isset($previousCatalogEntry['aliases']) && is_array($previousCatalogEntry['aliases'])) {
                $previousAliases = array_values(array_filter(
                    array_map(static fn ($alias) => trim((string) $alias), $previousCatalogEntry['aliases']),
                    static fn (string $alias): bool => $alias !== ''
                ));
            }

            $collection = TemplateImportPolicy::normalizeCollection(
                $lockedJob['collection'] ?? TemplateImportPolicy::DEFAULT_COLLECTION,
                false
            );

            $catalog[$slug] = [
                'title' => (string) $lockedJob['title'],
                'description' => trim((string) ($lockedJob['description'] ?? '')) !== ''
                    ? (string) $lockedJob['description']
                    : '',
                'category' => (string) $lockedJob['category'],
                'collection' => $collection,
                'aliases' => $previousAliases,
            ];
            ksort($catalog, SORT_NATURAL | SORT_FLAG_CASE);
            $this->writeCatalog($catalogPath, $catalog);
            $catalogChanged = true;

            $report = $this->decodeReport($lockedJob['report_json'] ?? null);
            $report['phase'] = 'published';
            $report['publish_validation'] = $validationReport;
            $report['asset_probe'] = $assetProbe;
            $report['published_at'] = gmdate(DATE_ATOM);
            $report['replaced_existing'] = $backup !== null;
            $report['rollback'] = [
                'backup_name' => $backup !== null ? basename($backup) : null,
                'previous_catalog_entry' => $previousCatalogEntry,
            ];

            $update = $this->pdo->prepare(
                "UPDATE template_import_jobs
                 SET status = 'published',
                     report_json = :report_json,
                     error_message = NULL,
                     staging_path = NULL,
                     published_at = UTC_TIMESTAMP()
                 WHERE id = :id AND status = 'ready'"
            );
            $update->execute([
                'report_json' => json_encode(
                    $report,
                    JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES
                ),
                'id' => $jobId,
            ]);
            if ($update->rowCount() !== 1) {
                throw new RuntimeException('Template import publish state changed concurrently.', 409);
            }

            $this->pdo->commit();
            $result = [
                'id' => $jobId,
                'status' => 'published',
                'slug' => $slug,
                'entry' => '/portfolio/portfolio/' . rawurlencode($slug) . '/',
                'replaced_existing' => $backup !== null,
            ];

            try {
                $this->removeDirectory($stagingPath);
                $this->pruneOldBackups($portfolioDirectory, $slug, $backup);
                $this->sectionEditor->invalidate($slug);
            } catch (Throwable $cleanupError) {
                error_log(
                    "Template publish cleanup failed for job {$jobId}: " .
                    $cleanupError->getMessage()
                );
            }

            return $result;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            if ($catalogChanged && is_string($catalogOriginal)) {
                $this->writeRawCatalog($catalogPath, $catalogOriginal);
            }
            if ($destinationInstalled && is_dir($destination)) {
                $this->removeDirectory($destination);
            }
            if (is_string($backup) && is_dir($backup) && !file_exists($destination)) {
                @rename($backup, $destination);
            }
            if (is_dir($incoming)) {
                $this->removeDirectory($incoming);
            }
            throw $e;
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /**
     * @return array{id:int,status:string}
     */
    public function discard(int $jobId): array
    {
        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare(
                'SELECT id, status, staging_path
                 FROM template_import_jobs
                 WHERE id = :id
                 FOR UPDATE'
            );
            $stmt->execute(['id' => $jobId]);
            $job = $stmt->fetch();
            if (!is_array($job)) {
                throw new RuntimeException('Template import job not found.', 404);
            }
            if (!in_array($job['status'], ['ready', 'failed'], true)) {
                throw new RuntimeException(
                    'Only a ready or failed template import can be discarded.',
                    409
                );
            }

            if (is_string($job['staging_path']) && $job['staging_path'] !== '') {
                $path = $this->validatedStagingPath($job['staging_path'], false);
                if ($path !== null) {
                    $this->removeDirectory($path);
                }
            }

            $update = $this->pdo->prepare(
                "UPDATE template_import_jobs
                 SET status = 'discarded',
                     staging_path = NULL,
                     error_message = NULL
                 WHERE id = :id"
            );
            $update->execute(['id' => $jobId]);
            $this->pdo->commit();

            return ['id' => $jobId, 'status' => 'discarded'];
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Restore the version that existed immediately before this publish.
     *
     * @return array{id:int,status:string,slug:string,entry:?string}
     */
    public function rollback(int $jobId): array
    {
        $job = $this->loadJob($jobId);
        if ($job['status'] !== 'published') {
            throw new RuntimeException('Only a published template import can be rolled back.', 409);
        }

        $slug = (string) $job['slug'];
        if (!TemplateImportPolicy::isAllowedSourceHost($slug)) {
            throw new RuntimeException('Published template slug failed policy validation.', 422);
        }
        $report = $this->decodeReport($job['report_json'] ?? null);
        $rollback = is_array($report['rollback'] ?? null) ? $report['rollback'] : [];
        $backupName = $rollback['backup_name'] ?? null;
        if ($backupName !== null) {
            $expected = '/\A\.backup-' . preg_quote($slug, '/') . '-\d{14}\z/D';
            if (!is_string($backupName) || preg_match($expected, $backupName) !== 1) {
                throw new RuntimeException('Template rollback metadata is invalid.', 422);
            }
        }

        $portfolioDirectory = TemplateImportPolicy::portfolioDirectory();
        $destination = $portfolioDirectory . DIRECTORY_SEPARATOR . $slug;
        if (!is_dir($destination)) {
            throw new RuntimeException('Published template directory is unavailable.', 409);
        }
        $backup = is_string($backupName)
            ? $portfolioDirectory . DIRECTORY_SEPARATOR . $backupName
            : null;
        if ($backup !== null && !is_dir($backup)) {
            throw new RuntimeException('Template rollback backup is unavailable.', 409);
        }

        $catalogPath = TemplateImportPolicy::catalogPath();
        $lock = fopen($catalogPath . '.lock', 'c+');
        if ($lock === false || !flock($lock, LOCK_EX)) {
            throw new RuntimeException('Unable to acquire the template catalog lock.', 503);
        }

        $catalogOriginal = null;
        $catalogChanged = false;
        $currentMoved = false;
        $backupRestored = false;
        $displaced = $portfolioDirectory .
            DIRECTORY_SEPARATOR .
            '.rollback-' . $jobId . '-' . bin2hex(random_bytes(5));

        try {
            $catalogOriginal = file_get_contents($catalogPath);
            if (!is_string($catalogOriginal)) {
                throw new RuntimeException('Unable to read the template catalog.');
            }
            $catalog = json_decode($catalogOriginal, true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($catalog)) {
                throw new RuntimeException('Template catalog is not a JSON object.');
            }

            $this->pdo->beginTransaction();
            $lockedJob = $this->lockPublishedJob($jobId);
            $lockedReport = $this->decodeReport($lockedJob['report_json'] ?? null);

            if (!rename($destination, $displaced)) {
                throw new RuntimeException('Unable to move the published template for rollback.');
            }
            $currentMoved = true;
            if ($backup !== null) {
                if (!rename($backup, $destination)) {
                    throw new RuntimeException('Unable to restore the template rollback backup.');
                }
                $backupRestored = true;
            }

            $previousCatalogEntry = $rollback['previous_catalog_entry'] ?? null;
            if (is_array($previousCatalogEntry)) {
                $catalog[$slug] = $previousCatalogEntry;
            } else {
                unset($catalog[$slug]);
            }
            ksort($catalog, SORT_NATURAL | SORT_FLAG_CASE);
            $this->writeCatalog($catalogPath, $catalog);
            $catalogChanged = true;

            $lockedReport['phase'] = 'rolled_back';
            $lockedReport['rolled_back_at'] = gmdate(DATE_ATOM);
            $update = $this->pdo->prepare(
                "UPDATE template_import_jobs
                 SET status = 'rolled_back',
                     report_json = :report_json
                 WHERE id = :id AND status = 'published'"
            );
            $update->execute([
                'report_json' => json_encode(
                    $lockedReport,
                    JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES
                ),
                'id' => $jobId,
            ]);
            if ($update->rowCount() !== 1) {
                throw new RuntimeException('Template rollback state changed concurrently.', 409);
            }
            $this->pdo->commit();

            try {
                $this->removeDirectory($displaced);
                $this->sectionEditor->invalidate($slug);
            } catch (Throwable $cleanupError) {
                error_log(
                    "Template rollback cleanup failed for job {$jobId}: " .
                    $cleanupError->getMessage()
                );
            }

            return [
                'id' => $jobId,
                'status' => 'rolled_back',
                'slug' => $slug,
                'entry' => $backupRestored
                    ? '/portfolio/portfolio/' . rawurlencode($slug) . '/'
                    : null,
            ];
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            if ($catalogChanged && is_string($catalogOriginal)) {
                try {
                    $this->writeRawCatalog($catalogPath, $catalogOriginal);
                } catch (Throwable $catalogError) {
                    error_log('Catalog rollback failed: ' . $catalogError->getMessage());
                }
            }
            if ($backupRestored && is_dir($destination) && is_string($backup)) {
                @rename($destination, $backup);
            }
            if ($currentMoved && is_dir($displaced) && !file_exists($destination)) {
                @rename($displaced, $destination);
            }
            throw $e;
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function loadJob(int $jobId): array
    {
        if ($jobId < 1) {
            throw new InvalidArgumentException('Invalid template import job ID.', 422);
        }
        $stmt = $this->pdo->prepare(
            'SELECT * FROM template_import_jobs WHERE id = :id'
        );
        $stmt->execute(['id' => $jobId]);
        $job = $stmt->fetch();
        if (!is_array($job)) {
            throw new RuntimeException('Template import job not found.', 404);
        }

        return $job;
    }

    /**
     * @return array<string, mixed>
     */
    private function lockReadyJob(int $jobId): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM template_import_jobs
             WHERE id = :id AND status = 'ready'
             FOR UPDATE"
        );
        $stmt->execute(['id' => $jobId]);
        $job = $stmt->fetch();
        if (!is_array($job)) {
            throw new RuntimeException('Template import is no longer ready to publish.', 409);
        }

        return $job;
    }

    /**
     * @return array<string, mixed>
     */
    private function lockPublishedJob(int $jobId): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM template_import_jobs
             WHERE id = :id AND status = 'published'
             FOR UPDATE"
        );
        $stmt->execute(['id' => $jobId]);
        $job = $stmt->fetch();
        if (!is_array($job)) {
            throw new RuntimeException('Template import is no longer published.', 409);
        }

        return $job;
    }

    private function validatedStagingPath(
        string $path,
        bool $required = true
    ): ?string {
        $root = realpath(TemplateImportPolicy::stagingRoot());
        $resolved = realpath($path);
        if ($resolved === false) {
            if (!$required) {
                return null;
            }
            throw new RuntimeException('Template staging directory is unavailable.', 422);
        }
        if ($root === false) {
            throw new RuntimeException('Template staging root is unavailable.');
        }

        $prefix = rtrim($root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'job-';
        if (
            !str_starts_with($resolved, $prefix) ||
            !is_dir($resolved) ||
            is_link($resolved)
        ) {
            throw new RuntimeException('Template staging path failed containment validation.', 422);
        }

        return $resolved;
    }

    private function copyDirectory(string $source, string $destination): void
    {
        if (!mkdir($destination, 0755)) {
            throw new RuntimeException('Unable to create the incoming template directory.');
        }

        try {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($source, FilesystemIterator::SKIP_DOTS),
                RecursiveIteratorIterator::SELF_FIRST
            );
            foreach ($iterator as $entry) {
                if ($entry->isLink()) {
                    throw new RuntimeException('Template contains a symbolic link.', 422);
                }
                $relative = substr($entry->getPathname(), strlen($source) + 1);
                $target = $destination . DIRECTORY_SEPARATOR . $relative;
                if ($entry->isDir()) {
                    if (!mkdir($target, 0755) && !is_dir($target)) {
                        throw new RuntimeException('Unable to copy a template directory.');
                    }
                } elseif (!copy($entry->getPathname(), $target)) {
                    throw new RuntimeException('Unable to copy a template file.');
                }
            }
        } catch (Throwable $e) {
            $this->removeDirectory($destination);
            throw $e;
        }
    }

    /**
     * @param array<string, mixed> $catalog
     */
    private function writeCatalog(string $path, array $catalog): void
    {
        $json = json_encode(
            $catalog,
            JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        ) . PHP_EOL;
        $this->writeRawCatalog($path, $json);
    }

    private function writeRawCatalog(string $path, string $contents): void
    {
        $temporary = dirname($path) .
            DIRECTORY_SEPARATOR .
            '.catalog-' . bin2hex(random_bytes(6)) . '.tmp';
        if (file_put_contents($temporary, $contents, LOCK_EX) === false) {
            throw new RuntimeException('Unable to write the template catalog.');
        }
        @chmod($temporary, 0644);
        if (!rename($temporary, $path)) {
            @unlink($temporary);
            throw new RuntimeException('Unable to atomically replace the template catalog.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeReport(mixed $value): array
    {
        if (!is_string($value) || $value === '') {
            return [];
        }
        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function pruneOldBackups(
        string $portfolioDirectory,
        string $slug,
        ?string $keep
    ): void {
        $pattern = $portfolioDirectory . DIRECTORY_SEPARATOR . '.backup-' . $slug . '-*';
        foreach (glob($pattern, GLOB_ONLYDIR) ?: [] as $backup) {
            if ($keep !== null && $backup === $keep) {
                continue;
            }
            $this->removeDirectory($backup);
        }
    }

    private function removeDirectory(string $path): void
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
                if (!rmdir($entry->getPathname())) {
                    throw new RuntimeException('Unable to remove a template directory.');
                }
            } elseif (!unlink($entry->getPathname())) {
                throw new RuntimeException('Unable to remove a template file.');
            }
        }
        if (!rmdir($path)) {
            throw new RuntimeException('Unable to remove a template directory.');
        }
    }
}
