<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Semantic page/section registry. Paths are server-owned; the model never invents URLs.
 */
final class PageRegistry
{
    /** @var array<string, array<string,mixed>> */
    private array $pagesById = [];

    /** @var array<string, array{page_id:string,section_id:string,hash:string,label:string}> */
    private array $sectionsById = [];

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
                $this->sectionsById[$sectionId] = [
                    'page_id' => $id,
                    'section_id' => $sectionId,
                    'hash' => $sectionId,
                    'label' => $sectionId,
                ];
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
        $sec = $this->sectionsById[$sectionId] ?? null;
        return $sec !== null && $sec['page_id'] === $pageId;
    }

    public function resolveSectionPage(string $sectionId): ?string
    {
        return $this->sectionsById[$sectionId]['page_id'] ?? null;
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

        return [
            'page_id' => $pageId,
            'section_id' => $sectionId,
            'path' => (string) $page['path'],
            'hash' => $sectionId,
            'external' => (bool) ($page['external'] ?? false),
        ];
    }

    /**
     * @return array{page_id:string,section_id:string,path:string,hash:string,external:bool,highlight:bool}|null
     */
    public function resolveShowSection(string $sectionId, ?string $pageId = null): ?array
    {
        $resolvedPage = $this->resolveSectionPage($sectionId);
        if ($resolvedPage === null) {
            return null;
        }
        if ($pageId !== null && $pageId !== '' && $pageId !== $resolvedPage) {
            if (!$this->sectionBelongsToPage($sectionId, $pageId)) {
                return null;
            }
            $resolvedPage = $pageId;
        }
        $nav = $this->resolveNavigate($resolvedPage, $sectionId);
        if ($nav === null) {
            return null;
        }
        return [
            'page_id' => $nav['page_id'],
            'section_id' => (string) $nav['section_id'],
            'path' => $nav['path'],
            'hash' => (string) $nav['hash'],
            'external' => $nav['external'],
            'highlight' => true,
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
