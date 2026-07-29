<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';
require_once __DIR__ . '/TemplateSectionExtractor.php';
require_once __DIR__ . '/TemplatePublishValidator.php';

final class TemplateSectionEditor
{
    private const DRAFT_TTL_SECONDS = 1800;

    public function __construct(
        private ?TemplateSectionExtractor $extractor = null,
        private ?TemplatePublishValidator $validator = null
    ) {
        $this->extractor ??= new TemplateSectionExtractor();
        $this->validator ??= new TemplatePublishValidator();
    }

    /**
     * @return array<string,mixed>
     */
    public function inventory(string $slug): array
    {
        [$directory, $indexPath] = $this->templatePaths($slug);
        $html = $this->readHtml($indexPath);
        $profile = $this->extractor->extract($html);
        $profile['slug'] = $slug;
        $profile['entry'] = '/portfolio/portfolio/' . rawurlencode($slug) . '/';
        $profile['can_rollback'] = is_file($this->backupPath($slug));
        $this->writeJson($this->profilePath($slug), $profile);

        return $this->publicProfile($profile);
    }

    /**
     * @param array<string,mixed> $input
     * @return array<string,mixed>
     */
    public function createDraft(string $slug, string $actor, array $input): array
    {
        $this->purgeExpiredDrafts();
        [, $indexPath] = $this->templatePaths($slug);
        $html = $this->readHtml($indexPath);
        $profile = $this->extractor->extract($html);
        $fingerprint = trim((string) ($input['fingerprint'] ?? ''));
        if ($fingerprint === '' || !hash_equals($profile['fingerprint'], $fingerprint)) {
            throw new RuntimeException(
                'Template content changed after the editor loaded. Refresh the inventory.',
                409
            );
        }

        $edits = $input['edits'] ?? null;
        if (!is_array($edits) || $edits === [] || count($edits) > 200) {
            throw new InvalidArgumentException('Submit between 1 and 200 field edits.', 422);
        }
        [$draftHtml, $changes] = $this->applyEdits($html, $profile, $edits);
        if ($changes === []) {
            throw new InvalidArgumentException('No field values changed.', 422);
        }
        $this->validateDraftHtml($draftHtml);

        $token = bin2hex(random_bytes(24));
        $directory = $this->storageDirectory('drafts') . DIRECTORY_SEPARATOR . $token;
        if (!mkdir($directory, 0700)) {
            throw new RuntimeException('Unable to create a private content draft.');
        }
        $expiresAt = time() + self::DRAFT_TTL_SECONDS;
        $metadata = [
            'token' => $token,
            'slug' => $slug,
            'actor' => $actor,
            'source_fingerprint' => $profile['fingerprint'],
            'changes' => $changes,
            'created_at' => gmdate(DATE_ATOM),
            'expires_at' => gmdate(DATE_ATOM, $expiresAt),
            'expires_unix' => $expiresAt,
        ];
        $this->writeFile($directory . DIRECTORY_SEPARATOR . 'index.html', $draftHtml, 0600);
        $this->writeJson($directory . DIRECTORY_SEPARATOR . 'draft.json', $metadata);

        return [
            'token' => $token,
            'slug' => $slug,
            'changes' => $changes,
            'change_count' => count($changes),
            'expires_at' => $metadata['expires_at'],
            'preview_url' => '/api/templates/' . rawurlencode($slug) .
                '/section-drafts/' . $token . '/preview/',
        ];
    }

    /**
     * @return array{path:string,mime:string,is_html:bool}
     */
    public function draftFile(
        string $slug,
        string $token,
        string $relativePath,
        string $actor
    ): array {
        $metadata = $this->loadDraft($slug, $token, $actor);
        $relativePath = rawurldecode($relativePath);
        if ($relativePath === '' || str_ends_with($relativePath, '/')) {
            $relativePath .= 'index.html';
        }
        $this->assertSafeRelativePath($relativePath);

        if ($relativePath === 'index.html') {
            $path = $this->draftDirectory($token) . DIRECTORY_SEPARATOR . 'index.html';
        } else {
            [$templateDirectory] = $this->templatePaths($slug);
            $path = realpath(
                $templateDirectory .
                DIRECTORY_SEPARATOR .
                str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath)
            );
            $prefix = rtrim($templateDirectory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
            if (
                $path === false ||
                !str_starts_with($path, $prefix) ||
                !is_file($path)
            ) {
                throw new RuntimeException('Draft preview file not found.', 404);
            }
        }
        if (!is_file($path)) {
            throw new RuntimeException('Draft preview file not found.', 404);
        }

        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $types = $this->previewTypes();
        if (!isset($types[$extension])) {
            throw new RuntimeException('Draft preview file type is not allowed.', 415);
        }

        return [
            'path' => $path,
            'mime' => $types[$extension],
            'is_html' => in_array($extension, ['html', 'htm'], true),
            'expires_at' => (string) $metadata['expires_at'],
        ];
    }

    /**
     * @return array<string,mixed>
     */
    public function applyDraft(string $slug, string $token, string $actor): array
    {
        $metadata = $this->loadDraft($slug, $token, $actor);
        [$templateDirectory, $indexPath] = $this->templatePaths($slug);
        $lock = $this->contentLock($slug);
        try {
            $current = $this->readHtml($indexPath);
            if (!hash_equals((string) $metadata['source_fingerprint'], hash('sha256', $current))) {
                throw new RuntimeException(
                    'Template content changed after this preview was created. Create a new preview.',
                    409
                );
            }
            $draftHtml = $this->readHtml(
                $this->draftDirectory($token) . DIRECTORY_SEPARATOR . 'index.html'
            );
            $this->validateDraftHtml($draftHtml);

            $backupPath = $this->backupPath($slug);
            $this->writeAtomicFile($backupPath, $current, 0600);
            $temporary = $templateDirectory .
                DIRECTORY_SEPARATOR .
                '.content-edit-' . bin2hex(random_bytes(6)) . '.tmp';
            $this->writeFile($temporary, $draftHtml, 0644);
            if (!rename($temporary, $indexPath)) {
                @unlink($temporary);
                throw new RuntimeException('Unable to atomically apply template content.');
            }

            $profile = $this->inventory($slug);
            $this->removeDirectory($this->draftDirectory($token));

            return [
                'slug' => $slug,
                'status' => 'applied',
                'change_count' => count($metadata['changes'] ?? []),
                'applied_at' => gmdate(DATE_ATOM),
                'can_rollback' => true,
                'fingerprint' => $profile['fingerprint'],
            ];
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /**
     * @return array<string,mixed>
     */
    public function rollback(string $slug): array
    {
        [$templateDirectory, $indexPath] = $this->templatePaths($slug);
        $lock = $this->contentLock($slug);
        try {
            $backupPath = $this->backupPath($slug);
            if (!is_file($backupPath)) {
                throw new RuntimeException('No content-edit backup is available.', 409);
            }
            $backupHtml = $this->readHtml($backupPath);
            $this->validateDraftHtml($backupHtml);
            $temporary = $templateDirectory .
                DIRECTORY_SEPARATOR .
                '.content-rollback-' . bin2hex(random_bytes(6)) . '.tmp';
            $this->writeFile($temporary, $backupHtml, 0644);
            if (!rename($temporary, $indexPath)) {
                @unlink($temporary);
                throw new RuntimeException('Unable to atomically restore template content.');
            }
            if (!unlink($backupPath)) {
                throw new RuntimeException('Content restored, but backup cleanup failed.');
            }
            $profile = $this->inventory($slug);

            return [
                'slug' => $slug,
                'status' => 'rolled_back',
                'rolled_back_at' => gmdate(DATE_ATOM),
                'can_rollback' => false,
                'fingerprint' => $profile['fingerprint'],
            ];
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    public function invalidate(string $slug): void
    {
        if (preg_match('/\A[a-z0-9][a-z0-9._-]{0,252}\z/D', $slug) !== 1) {
            throw new InvalidArgumentException('Invalid template slug.', 422);
        }
        foreach ([$this->profilePath($slug), $this->backupPath($slug)] as $path) {
            if (is_file($path) && !unlink($path)) {
                throw new RuntimeException('Unable to invalidate stale template section data.');
            }
        }
        $draftRoot = $this->storageDirectory('drafts');
        foreach (scandir($draftRoot) ?: [] as $name) {
            if (preg_match('/\A[a-f0-9]{48}\z/D', $name) !== 1) {
                continue;
            }
            $directory = $draftRoot . DIRECTORY_SEPARATOR . $name;
            $metadataPath = $directory . DIRECTORY_SEPARATOR . 'draft.json';
            if (!is_file($metadataPath)) {
                continue;
            }
            $metadata = json_decode((string) file_get_contents($metadataPath), true);
            if (
                is_array($metadata) &&
                hash_equals((string) ($metadata['slug'] ?? ''), $slug)
            ) {
                $this->removeDirectory($directory);
            }
        }
    }

    /**
     * @param array<string,mixed> $profile
     * @param array<int,mixed> $edits
     * @return array{0:string,1:array<int,array<string,mixed>>}
     */
    private function applyEdits(string $html, array $profile, array $edits): array
    {
        $fields = [];
        foreach ($profile['sections'] as $section) {
            foreach ($section['fields'] as $field) {
                $field['section_id'] = $section['id'];
                $field['section_label'] = $section['label'];
                $fields[$field['id']] = $field;
            }
        }

        $document = $this->extractor->loadDocument($html);
        $xpath = new DOMXPath($document);
        $changes = [];
        $seen = [];
        foreach ($edits as $edit) {
            if (!is_array($edit)) {
                throw new InvalidArgumentException('Each field edit must be an object.', 422);
            }
            $fieldId = trim((string) ($edit['field_id'] ?? ''));
            if ($fieldId === '' || isset($seen[$fieldId]) || !isset($fields[$fieldId])) {
                throw new InvalidArgumentException('Draft contains an unknown or duplicate field.', 422);
            }
            $seen[$fieldId] = true;
            $field = $fields[$fieldId];
            $value = (string) ($edit['value'] ?? '');
            $this->validateValue($field, $value);
            if (hash_equals((string) $field['value'], $value)) {
                continue;
            }

            $nodes = $xpath->query((string) $field['path']);
            $element = $nodes !== false ? $nodes->item(0) : null;
            if (!$element instanceof DOMElement) {
                throw new RuntimeException('An editable field moved. Refresh the inventory.', 409);
            }
            if ($field['kind'] === 'text') {
                while ($element->firstChild !== null) {
                    $element->removeChild($element->firstChild);
                }
                $element->appendChild($document->createTextNode($value));
            } else {
                $element->setAttribute((string) $field['attribute'], $value);
            }
            $changes[] = [
                'field_id' => $fieldId,
                'section_id' => $field['section_id'],
                'section_label' => $field['section_label'],
                'label' => $field['label'],
                'kind' => $field['kind'],
                'before' => $field['value'],
                'after' => $value,
            ];
        }

        $rendered = $document->saveHTML();
        if (!is_string($rendered) || trim($rendered) === '') {
            throw new RuntimeException('Unable to render the content draft.');
        }

        return [$rendered, $changes];
    }

    /**
     * @param array<string,mixed> $field
     */
    private function validateValue(array $field, string $value): void
    {
        if (mb_strlen($value) > (int) $field['max_length']) {
            throw new InvalidArgumentException(
                "{$field['label']} exceeds {$field['max_length']} characters.",
                422
            );
        }
        if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $value) === 1) {
            throw new InvalidArgumentException('Field value contains control characters.', 422);
        }
        if ($field['kind'] === 'text' && trim($value) === '') {
            throw new InvalidArgumentException("{$field['label']} cannot be empty.", 422);
        }
        if ($field['kind'] === 'image_url') {
            $this->assertSafeUrl($value, false);
        }
        if ($field['kind'] === 'link') {
            $this->assertSafeUrl($value, true);
        }
    }

    private function assertSafeUrl(string $value, bool $allowContactSchemes): void
    {
        $value = trim($value);
        if ($value === '') {
            throw new InvalidArgumentException('URL fields cannot be empty.', 422);
        }
        if (
            preg_match('~^https://~i', $value) === 1 ||
            preg_match('~^(?:/|\.{0,2}/|#)[^\s]*$~', $value) === 1 ||
            preg_match('~^[a-z0-9][a-z0-9._/-]*(?:[?#][^\s]*)?$~i', $value) === 1
        ) {
            return;
        }
        if (
            $allowContactSchemes &&
            preg_match('~^(?:mailto|tel):[^\s]+$~i', $value) === 1
        ) {
            return;
        }

        throw new InvalidArgumentException(
            'URLs must be HTTPS, relative, an anchor, email, or telephone link.',
            422
        );
    }

    private function validateDraftHtml(string $html): void
    {
        $directory = $this->storageDirectory('validation') .
            DIRECTORY_SEPARATOR .
            bin2hex(random_bytes(10));
        if (!mkdir($directory, 0700)) {
            throw new RuntimeException('Unable to initialize content validation.');
        }
        try {
            $this->writeFile($directory . DIRECTORY_SEPARATOR . 'index.html', $html, 0600);
            $this->validator->validate($directory);
        } finally {
            $this->removeDirectory($directory);
        }
    }

    /**
     * @return array<string,mixed>
     */
    private function loadDraft(string $slug, string $token, string $actor): array
    {
        if (preg_match('/\A[a-f0-9]{48}\z/D', $token) !== 1) {
            throw new InvalidArgumentException('Invalid content draft token.', 422);
        }
        $path = $this->draftDirectory($token) . DIRECTORY_SEPARATOR . 'draft.json';
        if (!is_file($path)) {
            throw new RuntimeException('Content draft not found or expired.', 404);
        }
        $metadata = json_decode($this->readHtml($path), true, 512, JSON_THROW_ON_ERROR);
        if (
            !is_array($metadata) ||
            !hash_equals((string) ($metadata['slug'] ?? ''), $slug) ||
            !hash_equals((string) ($metadata['actor'] ?? ''), $actor)
        ) {
            throw new RuntimeException('Content draft is unavailable to this user.', 403);
        }
        if ((int) ($metadata['expires_unix'] ?? 0) < time()) {
            $this->removeDirectory($this->draftDirectory($token));
            throw new RuntimeException('Content draft expired. Create a new preview.', 410);
        }

        return $metadata;
    }

    /**
     * @return array{0:string,1:string}
     */
    private function templatePaths(string $slug): array
    {
        if (preg_match('/\A[a-z0-9][a-z0-9._-]{0,252}\z/D', $slug) !== 1) {
            throw new InvalidArgumentException('Invalid template slug.', 422);
        }
        $directory = realpath(
            TemplateImportPolicy::portfolioDirectory() . DIRECTORY_SEPARATOR . $slug
        );
        $root = TemplateImportPolicy::portfolioDirectory();
        if (
            $directory === false ||
            !str_starts_with(
                $directory,
                rtrim($root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR
            ) ||
            str_starts_with(basename($directory), '.')
        ) {
            throw new RuntimeException('Published template not found.', 404);
        }
        $index = $directory . DIRECTORY_SEPARATOR . 'index.html';
        if (!is_file($index) || is_link($index)) {
            throw new RuntimeException('Published template homepage not found.', 404);
        }

        return [$directory, $index];
    }

    private function profilePath(string $slug): string
    {
        return $this->storageDirectory('profiles') . DIRECTORY_SEPARATOR . $slug . '.json';
    }

    private function backupPath(string $slug): string
    {
        return $this->storageDirectory('backups') . DIRECTORY_SEPARATOR . $slug . '.index.html';
    }

    private function draftDirectory(string $token): string
    {
        return $this->storageDirectory('drafts') . DIRECTORY_SEPARATOR . $token;
    }

    private function storageDirectory(string $child): string
    {
        $root = TemplateImportPolicy::profileRoot();
        if (!is_dir($root) && !mkdir($root, 0700, true) && !is_dir($root)) {
            throw new RuntimeException('Unable to create private template profile storage.');
        }
        $directory = $root . DIRECTORY_SEPARATOR . $child;
        if (
            !is_dir($directory) &&
            !mkdir($directory, 0700, true) &&
            !is_dir($directory)
        ) {
            throw new RuntimeException("Unable to create template {$child} storage.");
        }
        if (is_link($directory) || !is_writable($directory)) {
            throw new RuntimeException("Template {$child} storage is not a writable private directory.");
        }

        return $directory;
    }

    /**
     * @return resource
     */
    private function contentLock(string $slug)
    {
        $path = $this->storageDirectory('locks') . DIRECTORY_SEPARATOR . $slug . '.lock';
        $lock = fopen($path, 'c+');
        if ($lock === false || !flock($lock, LOCK_EX)) {
            throw new RuntimeException('Unable to lock template content.', 503);
        }

        return $lock;
    }

    private function purgeExpiredDrafts(): void
    {
        $root = $this->storageDirectory('drafts');
        foreach (scandir($root) ?: [] as $name) {
            if (preg_match('/\A[a-f0-9]{48}\z/D', $name) !== 1) {
                continue;
            }
            $directory = $root . DIRECTORY_SEPARATOR . $name;
            $metadataPath = $directory . DIRECTORY_SEPARATOR . 'draft.json';
            $expires = 0;
            if (is_file($metadataPath)) {
                $metadata = json_decode((string) file_get_contents($metadataPath), true);
                $expires = (int) ($metadata['expires_unix'] ?? 0);
            }
            if ($expires < time()) {
                $this->removeDirectory($directory);
            }
        }
    }

    private function assertSafeRelativePath(string $path): void
    {
        if (
            str_contains($path, "\0") ||
            str_contains($path, '..') ||
            str_starts_with($path, '/') ||
            str_starts_with($path, '\\')
        ) {
            throw new InvalidArgumentException('Invalid draft preview path.', 422);
        }
    }

    private function readHtml(string $path): string
    {
        $content = file_get_contents($path);
        if (!is_string($content) || $content === '') {
            throw new RuntimeException('Unable to read template content.');
        }

        return $content;
    }

    private function writeFile(string $path, string $content, int $mode): void
    {
        if (file_put_contents($path, $content, LOCK_EX) === false) {
            throw new RuntimeException('Unable to write private template content.');
        }
        @chmod($path, $mode);
    }

    private function writeAtomicFile(string $path, string $content, int $mode): void
    {
        $temporary = dirname($path) .
            DIRECTORY_SEPARATOR .
            '.' . basename($path) . '-' . bin2hex(random_bytes(6)) . '.tmp';
        $this->writeFile($temporary, $content, $mode);
        if (!rename($temporary, $path)) {
            @unlink($temporary);
            throw new RuntimeException('Unable to atomically write private template content.');
        }
    }

    /**
     * @param array<string,mixed> $value
     */
    private function writeJson(string $path, array $value): void
    {
        $this->writeAtomicFile(
            $path,
            json_encode(
                $value,
                JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
            ) . PHP_EOL,
            0600
        );
    }

    /**
     * @param array<string,mixed> $profile
     * @return array<string,mixed>
     */
    private function publicProfile(array $profile): array
    {
        return [
            'slug' => $profile['slug'],
            'entry' => $profile['entry'],
            'fingerprint' => $profile['fingerprint'],
            'generated_at' => $profile['generated_at'],
            'sections' => $profile['sections'],
            'totals' => $profile['totals'],
            'can_rollback' => (bool) $profile['can_rollback'],
        ];
    }

    /**
     * @return array<string,string>
     */
    private function previewTypes(): array
    {
        return [
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
    }

    private function removeDirectory(string $path): void
    {
        if (!is_dir($path) || is_link($path)) {
            @unlink($path);
            return;
        }
        $root = realpath(TemplateImportPolicy::profileRoot());
        $resolved = realpath($path);
        if (
            $root === false ||
            $resolved === false ||
            !str_starts_with($resolved, rtrim($root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR)
        ) {
            throw new RuntimeException('Refusing to remove content outside profile storage.');
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
}
