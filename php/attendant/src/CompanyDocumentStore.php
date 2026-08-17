<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Access-controlled company corpus under attendant/company/.
 * Visitor-facing retrieval may only return PUBLIC + CUSTOMER_CONTEXT.
 */
final class CompanyDocumentStore
{
    public const ACCESS_PUBLIC = 'PUBLIC';
    public const ACCESS_CUSTOMER = 'CUSTOMER_CONTEXT';
    public const ACCESS_INTERNAL = 'ATTENDANT_INTERNAL';
    public const ACCESS_OPERATOR = 'OPERATOR_ONLY';
    public const ACCESS_SYSTEM = 'SYSTEM_ONLY';

    /** @var list<string> */
    public const VISITOR_ALLOWED = [self::ACCESS_PUBLIC, self::ACCESS_CUSTOMER];

    private string $root;

    /** @var array{documents?:list<array<string,mixed>>,visitor_allowed?:list<string>}|null */
    private ?array $manifest = null;

    public function __construct(?string $companyDir = null)
    {
        $this->root = $companyDir ?? (attendant_contract_dir() . DIRECTORY_SEPARATOR . 'company');
    }

    /**
     * @return list<array{id:string,title:string,access:string,slug:?string,public_route:?string,topics:list<string>}>
     */
    public function listForAccess(array $allowedAccess): array
    {
        $allowed = array_fill_keys($allowedAccess, true);
        $out = [];
        foreach ($this->manifest()['documents'] ?? [] as $doc) {
            if (!is_array($doc)) {
                continue;
            }
            $access = (string) ($doc['access'] ?? '');
            if (!isset($allowed[$access])) {
                continue;
            }
            $out[] = [
                'id' => (string) ($doc['id'] ?? ''),
                'title' => (string) ($doc['title'] ?? ''),
                'access' => $access,
                'slug' => isset($doc['slug']) && is_string($doc['slug']) ? $doc['slug'] : null,
                'public_route' => isset($doc['public_route']) && is_string($doc['public_route']) ? $doc['public_route'] : null,
                'topics' => array_values(array_filter($doc['topics'] ?? [], 'is_string')),
            ];
        }
        return $out;
    }

    /**
     * @return list<array{id:string,title:string,slug:string,route:string}>
     */
    public function listPublicPolicies(): array
    {
        $out = [];
        foreach ($this->listForAccess([self::ACCESS_PUBLIC]) as $doc) {
            if ($doc['slug'] === null || $doc['public_route'] === null) {
                continue;
            }
            $out[] = [
                'id' => $doc['id'],
                'title' => $doc['title'],
                'slug' => $doc['slug'],
                'route' => $doc['public_route'],
            ];
        }
        return $out;
    }

    /**
     * @param list<string> $allowedAccess
     * @return array{ok:bool,code?:string,document?:array<string,mixed>}
     */
    public function getById(string $id, array $allowedAccess): array
    {
        $clean = str_starts_with($id, 'company:') ? substr($id, 8) : $id;
        $meta = $this->findMeta(static fn (array $d): bool => ($d['id'] ?? '') === $clean);
        return $this->loadIfAllowed($meta, $allowedAccess);
    }

    /**
     * @param list<string> $allowedAccess
     * @return array{ok:bool,code?:string,document?:array<string,mixed>}
     */
    public function getBySlug(string $slug, array $allowedAccess): array
    {
        $meta = $this->findMeta(static fn (array $d): bool => ($d['slug'] ?? null) === $slug);
        return $this->loadIfAllowed($meta, $allowedAccess);
    }

    /**
     * @param list<string> $allowedAccess
     * @return list<array{id:string,title:string,text:string,source:string,access:string,public_route:?string}>
     */
    public function search(string $query, array $allowedAccess, int $limit = 4): array
    {
        $limit = max(1, min(6, $limit));
        $q = mb_strtolower(trim($query));
        if ($q === '' || mb_strlen($q) > 200) {
            return [];
        }
        $tokens = preg_split('/\s+/', $q) ?: [];
        $tokens = array_values(array_filter($tokens, static fn (string $t): bool => mb_strlen($t) >= 2));
        $allowed = array_fill_keys($allowedAccess, true);

        $scored = [];
        foreach ($this->manifest()['documents'] ?? [] as $doc) {
            if (!is_array($doc)) {
                continue;
            }
            $access = (string) ($doc['access'] ?? '');
            if (!isset($allowed[$access])) {
                continue;
            }
            $loaded = $this->readBody($doc);
            if ($loaded === null) {
                continue;
            }
            $topics = implode(' ', array_filter($doc['topics'] ?? [], 'is_string'));
            $hay = mb_strtolower(
                (string) ($doc['title'] ?? '') . ' ' .
                (string) ($doc['id'] ?? '') . ' ' .
                $topics . ' ' .
                $loaded
            );
            $score = 0;
            if (str_contains($hay, $q)) {
                $score += 10;
            }
            foreach ($tokens as $token) {
                if (str_contains($hay, $token)) {
                    $score += 2;
                }
            }
            foreach ($doc['topics'] ?? [] as $topic) {
                if (!is_string($topic)) {
                    continue;
                }
                $tl = mb_strtolower($topic);
                if ($tl !== '' && str_contains($q, $tl)) {
                    $score += 6;
                }
            }
            if ($score > 0) {
                $scored[] = [
                    'score' => $score,
                    'hit' => [
                        'id' => 'company:' . (string) ($doc['id'] ?? ''),
                        'title' => (string) ($doc['title'] ?? ''),
                        'text' => $this->excerpt($loaded, 900),
                        'source' => 'company/' . (string) ($doc['file'] ?? ''),
                        'access' => $access,
                        'public_route' => isset($doc['public_route']) && is_string($doc['public_route'])
                            ? $doc['public_route']
                            : null,
                    ],
                ];
            }
        }

        usort($scored, static fn (array $a, array $b): int => $b['score'] <=> $a['score']);
        $hits = [];
        foreach (array_slice($scored, 0, $limit) as $row) {
            $hits[] = $row['hit'];
        }
        return $hits;
    }

    public function isVisitorDeniedId(string $id): bool
    {
        $clean = str_starts_with($id, 'company:') ? substr($id, 8) : $id;
        $meta = $this->findMeta(static fn (array $d): bool => ($d['id'] ?? '') === $clean);
        if ($meta === null) {
            return false;
        }
        $access = (string) ($meta['access'] ?? '');
        return !in_array($access, self::VISITOR_ALLOWED, true);
    }

    /**
     * @return array<string,mixed>
     */
    private function manifest(): array
    {
        if ($this->manifest !== null) {
            return $this->manifest;
        }
        $path = $this->root . DIRECTORY_SEPARATOR . 'manifest.json';
        $raw = is_file($path) ? file_get_contents($path) : false;
        $decoded = is_string($raw) ? json_decode($raw, true) : null;
        $this->manifest = is_array($decoded) ? $decoded : ['documents' => []];
        return $this->manifest;
    }

    /**
     * @param callable(array):bool $pred
     * @return array<string,mixed>|null
     */
    private function findMeta(callable $pred): ?array
    {
        foreach ($this->manifest()['documents'] ?? [] as $doc) {
            if (is_array($doc) && $pred($doc)) {
                return $doc;
            }
        }
        return null;
    }

    /**
     * @param array<string,mixed>|null $meta
     * @param list<string> $allowedAccess
     * @return array{ok:bool,code?:string,document?:array<string,mixed>}
     */
    private function loadIfAllowed(?array $meta, array $allowedAccess): array
    {
        if ($meta === null) {
            return ['ok' => false, 'code' => 'not_found'];
        }
        $access = (string) ($meta['access'] ?? '');
        if (!in_array($access, $allowedAccess, true)) {
            return ['ok' => false, 'code' => 'forbidden'];
        }
        $body = $this->readBody($meta);
        if ($body === null) {
            return ['ok' => false, 'code' => 'not_found'];
        }
        return [
            'ok' => true,
            'document' => [
                'id' => (string) ($meta['id'] ?? ''),
                'title' => (string) ($meta['title'] ?? ''),
                'access' => $access,
                'slug' => isset($meta['slug']) && is_string($meta['slug']) ? $meta['slug'] : null,
                'public_route' => isset($meta['public_route']) && is_string($meta['public_route']) ? $meta['public_route'] : null,
                'markdown' => $body,
            ],
        ];
    }

    /**
     * @param array<string,mixed> $meta
     */
    private function readBody(array $meta): ?string
    {
        $file = (string) ($meta['file'] ?? '');
        if ($file === '' || str_contains($file, '..') || str_contains($file, '/') || str_contains($file, '\\')) {
            return null;
        }
        $path = $this->root . DIRECTORY_SEPARATOR . $file;
        if (!is_file($path)) {
            return null;
        }
        $raw = file_get_contents($path);
        if ($raw === false || trim($raw) === '') {
            return null;
        }
        return trim($raw);
    }

    private function excerpt(string $markdown, int $max): string
    {
        $plain = preg_replace('/^#+\s*/m', '', $markdown) ?? $markdown;
        $plain = preg_replace('/\*\*?/', '', $plain) ?? $plain;
        $plain = trim(preg_replace('/\s+/', ' ', $plain) ?? $plain);
        if (mb_strlen($plain) <= $max) {
            return $plain;
        }
        return mb_substr($plain, 0, $max - 1) . '…';
    }
}
