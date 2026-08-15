<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Keyword/synonym search over curated FAQ and copy chunks. Not prices.
 */
final class KnowledgeCorpus
{
    /** @var list<array<string,mixed>> */
    private array $chunks = [];

    public function __construct(?string $knowledgeDir = null)
    {
        $dir = $knowledgeDir ?? (__DIR__ . '/../knowledge');
        $path = $dir . DIRECTORY_SEPARATOR . 'corpus.json';
        $raw = json_decode((string) file_get_contents($path), true);
        $chunks = is_array($raw) ? ($raw['chunks'] ?? []) : [];
        foreach ($chunks as $chunk) {
            if (is_array($chunk) && isset($chunk['id'], $chunk['text'])) {
                $this->chunks[] = $chunk;
            }
        }
    }

    /**
     * @return list<array{id:string,title:string,text:string,source:string}>
     */
    public function search(string $query, int $limit = 4): array
    {
        $limit = max(1, min(6, $limit));
        $q = mb_strtolower(trim($query));
        if ($q === '' || mb_strlen($q) > 200) {
            return [];
        }
        $tokens = preg_split('/\s+/', $q) ?: [];
        $tokens = array_values(array_filter($tokens, static fn (string $t): bool => mb_strlen($t) >= 2));

        $scored = [];
        foreach ($this->chunks as $chunk) {
            $hay = mb_strtolower(
                (string) ($chunk['title'] ?? '') . ' ' .
                (string) ($chunk['text'] ?? '') . ' ' .
                implode(' ', $chunk['keywords'] ?? [])
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
            foreach ($chunk['keywords'] ?? [] as $kw) {
                if (!is_string($kw)) {
                    continue;
                }
                $kwl = mb_strtolower($kw);
                if ($kwl !== '' && str_contains($q, $kwl)) {
                    $score += 5;
                }
            }
            if ($score > 0) {
                $scored[] = ['score' => $score, 'chunk' => $chunk];
            }
        }

        usort($scored, static fn (array $a, array $b): int => $b['score'] <=> $a['score']);
        $hits = [];
        foreach (array_slice($scored, 0, $limit) as $row) {
            $c = $row['chunk'];
            $hits[] = [
                'id' => (string) $c['id'],
                'title' => (string) ($c['title'] ?? ''),
                'text' => (string) $c['text'],
                'source' => (string) ($c['source'] ?? ''),
            ];
        }
        return $hits;
    }
}
