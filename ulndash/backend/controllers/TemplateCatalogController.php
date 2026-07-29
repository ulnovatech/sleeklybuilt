<?php

declare(strict_types=1);

require_once __DIR__ . '/../services/TemplateCatalogService.php';
require_once __DIR__ . '/../services/TemplateAuditLogger.php';
require_once __DIR__ . '/../services/TemplateSectionEditor.php';

final class TemplateCatalogController
{
    public function __construct(
        private ?TemplateCatalogService $catalog = null,
        private ?TemplateAuditLogger $audit = null,
        private ?TemplateSectionEditor $sections = null
    ) {
        $this->catalog ??= new TemplateCatalogService();
        $this->sections ??= new TemplateSectionEditor();
    }

    /**
     * @return array{items:array<int,array<string,mixed>>,total:int}
     */
    public function index(): array
    {
        return $this->catalog->list();
    }

    /**
     * @param array<string,mixed> $input
     * @return array<string,mixed>
     */
    public function update(string $slug, array $input, ?array $user): array
    {
        $actor = TemplateAuditLogger::actor($user);
        $result = $this->catalog->update(rawurldecode($slug), $input);
        try {
            $this->audit?->log(
                'metadata_updated',
                $actor,
                (string) $result['slug'],
                null,
                [
                    'fields' => array_values(array_intersect(
                        array_keys($input),
                        ['title', 'description', 'category', 'aliases']
                    )),
                ]
            );
        } catch (Throwable $e) {
            error_log('Template metadata audit failed: ' . $e->getMessage());
        }

        return $result;
    }

    /**
     * @return array<string,mixed>
     */
    public function sections(string $slug): array
    {
        return $this->sections->inventory(rawurldecode($slug));
    }

    /**
     * @param array<string,mixed> $input
     * @param array<string,mixed>|null $user
     * @return array<string,mixed>
     */
    public function previewSections(string $slug, array $input, ?array $user): array
    {
        return $this->sections->createDraft(
            rawurldecode($slug),
            TemplateAuditLogger::actor($user),
            $input
        );
    }

    /**
     * @param array<string,mixed>|null $user
     * @return array<string,mixed>
     */
    public function applySectionDraft(
        string $slug,
        string $token,
        ?array $user
    ): array {
        $actor = TemplateAuditLogger::actor($user);
        $result = $this->sections->applyDraft(rawurldecode($slug), $token, $actor);
        $this->recordAudit(
            'sections_updated',
            $actor,
            (string) $result['slug'],
            ['change_count' => $result['change_count']]
        );

        return $result;
    }

    /**
     * @param array<string,mixed>|null $user
     * @return array<string,mixed>
     */
    public function rollbackSections(string $slug, ?array $user): array
    {
        $actor = TemplateAuditLogger::actor($user);
        $result = $this->sections->rollback(rawurldecode($slug));
        $this->recordAudit(
            'sections_rolled_back',
            $actor,
            (string) $result['slug']
        );

        return $result;
    }

    /**
     * @param array<string,mixed>|null $user
     */
    public function serveSectionDraft(
        string $slug,
        string $token,
        string $relativePath,
        ?array $user
    ): never {
        $file = $this->sections->draftFile(
            rawurldecode($slug),
            $token,
            $relativePath,
            TemplateAuditLogger::actor($user)
        );
        header('Content-Type: ' . $file['mime']);
        header('Cache-Control: private, no-store');
        header('X-Content-Type-Options: nosniff');
        if ($file['is_html']) {
            header(
                "Content-Security-Policy: sandbox allow-scripts allow-forms; " .
                "default-src 'self' https: data: blob:; " .
                "script-src 'self' https: 'unsafe-inline' 'unsafe-eval'; " .
                "style-src 'self' https: 'unsafe-inline'; " .
                "img-src 'self' https: data: blob:; font-src 'self' https: data:;"
            );
        }
        readfile($file['path']);
        exit;
    }

    /**
     * @param array<string,mixed> $details
     */
    private function recordAudit(
        string $action,
        string $actor,
        string $slug,
        array $details = []
    ): void {
        try {
            $this->audit?->log($action, $actor, $slug, null, $details);
        } catch (Throwable $e) {
            error_log("Template section audit {$action} failed: " . $e->getMessage());
        }
    }
}
