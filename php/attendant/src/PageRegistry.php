<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Semantic page/section registry. Paths are server-owned; the model never invents URLs.
 *
 * Section ids may repeat across pages (e.g. `features`, `faq`, `hero`). Resolution prefers
 * an explicit page_id; without one, only globally unique section ids resolve.
 */
final class PageRegistry
{
    /** @var array<string, array<string,mixed>> */
    private array $pagesById = [];

    /** @var array<string, list<string>> section_id => page_ids that declare it */
    private array $pagesBySection = [];

    public function __construct(?string $knowledgeDir = null)
    {
        $dir = $knowledgeDir ?? (__DIR__ . '/../knowledge');
        $raw = $this->loadJson($dir . DIRECTORY_SEPARATOR . 'pages.json');
        $pages = $raw['pages'] ?? [];
        if (!is_array($pages)) {
            throw new \RuntimeException('pages.json missing pages array');
        }
        foreach ($pages as $page) {
            if (!is_array($page) || empty($page['page_id'])) {
                continue;
            }
            $id = (string) $page['page_id'];
            $this->pagesById[$id] = $page;
            foreach ($page['section_ids'] ?? [] as $sectionId) {
                if (!is_string($sectionId) || $sectionId === '') {
                    continue;
                }
                if (!isset($this->pagesBySection[$sectionId])) {
                    $this->pagesBySection[$sectionId] = [];
                }
                if (!in_array($id, $this->pagesBySection[$sectionId], true)) {
                    $this->pagesBySection[$sectionId][] = $id;
                }
            }
        }
    }

    public function hasPage(string $pageId): bool
    {
        return isset($this->pagesById[$pageId]);
    }

    /**
     * @return array<string,mixed>|null
     */
    public function getPage(string $pageId): ?array
    {
        return $this->pagesById[$pageId] ?? null;
    }

    public function sectionBelongsToPage(string $sectionId, string $pageId): bool
    {
        return in_array($pageId, $this->pagesBySection[$sectionId] ?? [], true);
    }

    /**
     * Owning page when the section id is unique across the registry; null if unknown or ambiguous.
     */
    public function resolveSectionPage(string $sectionId): ?string
    {
        $pages = $this->pagesBySection[$sectionId] ?? [];
        if (count($pages) === 1) {
            return $pages[0];
        }
        return null;
    }

    /**
     * @return array{page_id:string,section_id:?string,path:string,hash:?string,external:bool}|null
     */
    public function resolveNavigate(string $pageId, ?string $sectionId = null): ?array
    {
        $page = $this->getPage($pageId);
        if ($page === null) {
            return null;
        }
        if ($sectionId !== null && $sectionId !== '') {
            if (!$this->sectionBelongsToPage($sectionId, $pageId)) {
                return null;
            }
        } else {
            $sectionId = null;
        }

        $basePath = (string) $page['path'];
        $sectionNav = (string) ($page['section_nav'] ?? 'hash');
        $path = $basePath;
        $hash = $sectionId;
        if ($sectionId !== null && $sectionNav === 'path_segment') {
            $path = rtrim($basePath, '/') . '/' . $sectionId;
            $hash = null;
        }

        return [
            'page_id' => $pageId,
            'section_id' => $sectionId,
            'path' => $path,
            'hash' => $hash,
            'external' => (bool) ($page['external'] ?? false),
        ];
    }

    /**
     * @return array{page_id:string,section_id:string,path:string,hash:?string,external:bool,highlight:bool}|null
     */
    public function resolveShowSection(string $sectionId, ?string $pageId = null): ?array
    {
        if ($pageId !== null && $pageId !== '') {
            if (!$this->sectionBelongsToPage($sectionId, $pageId)) {
                return null;
            }
            $resolvedPage = $pageId;
        } else {
            $resolvedPage = $this->resolveSectionPage($sectionId);
            if ($resolvedPage === null) {
                return null;
            }
        }
        $nav = $this->resolveNavigate($resolvedPage, $sectionId);
        if ($nav === null || $nav['section_id'] === null || $nav['section_id'] === '') {
            return null;
        }
        return [
            'page_id' => $nav['page_id'],
            'section_id' => (string) $nav['section_id'],
            'path' => $nav['path'],
            'hash' => $nav['hash'],
            'external' => $nav['external'],
            'highlight' => true,
        ];
    }

    /**
     * Secure checkout handoff after a real quote — portfolio Flutterwave entry only.
     * Never invents hosts; query is limited to known template + orderable package ids.
     *
     * @return array{
     *   type:string,
     *   page_id:string,
     *   section_id:null,
     *   path:string,
     *   hash:null,
     *   external:bool,
     *   payment_handoff:bool
     * }|null
     */
    public function resolvePaymentHandoff(?string $template = null, ?string $package = null): ?array
    {
        $nav = $this->resolveNavigate('portfolio-order');
        if ($nav === null) {
            return null;
        }

        $path = (string) $nav['path'];
        $query = [];
        $template = trim((string) $template);
        if ($template !== '' && preg_match('/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/', $template) === 1) {
            $query['template'] = $template;
        }
        $package = strtolower(trim((string) $package));
        if (in_array($package, ['basic', 'smart', 'premium'], true)) {
            $query['package'] = $package;
        }
        if ($query !== []) {
            $path .= (str_contains($path, '?') ? '&' : '?') . http_build_query($query);
        }

        return [
            'type' => 'navigate',
            'page_id' => 'portfolio-order',
            'section_id' => null,
            'path' => $path,
            'hash' => null,
            'external' => true,
            'payment_handoff' => true,
        ];
    }

    /**
     * @return list<string>
     */
    public function pageIds(): array
    {
        return array_keys($this->pagesById);
    }

    /**
     * @return array<string,mixed>
     */
    private function loadJson(string $path): array
    {
        if (!is_file($path)) {
            throw new \RuntimeException('Missing knowledge file: ' . $path);
        }
        $decoded = json_decode((string) file_get_contents($path), true);
        if (!is_array($decoded)) {
            throw new \RuntimeException('Invalid JSON: ' . $path);
        }
        return $decoded;
    }
}
