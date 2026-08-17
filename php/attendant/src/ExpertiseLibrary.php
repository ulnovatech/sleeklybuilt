<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Selective expertise cards + guidance for prompt injection.
 */
final class ExpertiseLibrary
{
    private string $root;

    /** @var array{cards?:list<array<string,mixed>>,guidance?:list<array<string,mixed>>}|null */
    private ?array $manifest = null;

    public function __construct(?string $expertiseDir = null)
    {
        $this->root = $expertiseDir ?? (attendant_contract_dir() . DIRECTORY_SEPARATOR . 'expertise');
    }

    /**
     * @param array<string,mixed> $page
     * @param array<string,mixed> $draft
     * @return array{cards:list<array<string,mixed>>,guidance:list<array{id:string,text:string}>}
     */
    public function select(array $page, array $draft, string $message, int $maxCards = 2, int $maxGuidance = 2): array
    {
        $maxCards = max(1, min(3, $maxCards));
        $maxGuidance = max(0, min(3, $maxGuidance));
        $manifest = $this->manifest();
        $hay = mb_strtolower(
            $message . ' ' .
            (string) ($page['page_id'] ?? '') . ' ' .
            (string) ($page['visible_service_id'] ?? '') . ' ' .
            (string) ($draft['service_id'] ?? '') . ' ' .
            (string) ($draft['package'] ?? '') . ' ' .
            (string) (($draft['customer_model']['org_type'] ?? '')) . ' ' .
            (string) (($draft['customer_model']['objective'] ?? ''))
        );

        $scoredCards = [];
        foreach ($manifest['cards'] ?? [] as $meta) {
            if (!is_array($meta)) {
                continue;
            }
            $score = $this->scoreMeta($meta, $hay, $draft, $page);
            if ($score > 0) {
                $scoredCards[] = ['score' => $score, 'meta' => $meta];
            }
        }
        usort($scoredCards, static fn (array $a, array $b): int => $b['score'] <=> $a['score']);

        $cards = [];
        foreach (array_slice($scoredCards, 0, $maxCards) as $row) {
            $loaded = $this->loadCard($row['meta']);
            if ($loaded !== null) {
                $cards[] = $loaded;
            }
        }

        // Default: if on websites / school website intent and no card, include business-basic
        if ($cards === [] && (str_contains($hay, 'website') || str_contains($hay, 'school') || ($page['page_id'] ?? '') === 'websites')) {
            foreach ($manifest['cards'] ?? [] as $meta) {
                if (is_array($meta) && ($meta['id'] ?? '') === 'business-basic') {
                    $loaded = $this->loadCard($meta);
                    if ($loaded !== null) {
                        $cards[] = $loaded;
                    }
                    break;
                }
            }
        }

        $scoredGuide = [];
        foreach ($manifest['guidance'] ?? [] as $meta) {
            if (!is_array($meta)) {
                continue;
            }
            $score = $this->scoreMeta($meta, $hay, $draft, $page);
            if ($score > 0) {
                $scoredGuide[] = ['score' => $score, 'meta' => $meta];
            }
        }
        usort($scoredGuide, static fn (array $a, array $b): int => $b['score'] <=> $a['score']);

        $guidance = [];
        foreach (array_slice($scoredGuide, 0, $maxGuidance) as $row) {
            $text = $this->loadGuidance($row['meta']);
            if ($text !== null) {
                $guidance[] = [
                    'id' => (string) ($row['meta']['id'] ?? ''),
                    'text' => $text,
                ];
            }
        }

        return ['cards' => $cards, 'guidance' => $guidance];
    }

    /**
     * @param array<string,mixed> $meta
     * @param array<string,mixed> $draft
     * @param array<string,mixed> $page
     */
    private function scoreMeta(array $meta, string $hay, array $draft, array $page): int
    {
        $score = 0;
        foreach ($meta['topics'] ?? [] as $topic) {
            if (!is_string($topic) || $topic === '') {
                continue;
            }
            if (str_contains($hay, mb_strtolower($topic))) {
                $score += 3;
            }
        }
        $serviceIds = $meta['service_ids'] ?? [];
        $focusService = (string) ($draft['service_id'] ?? $page['visible_service_id'] ?? '');
        if ($focusService !== '' && is_array($serviceIds) && in_array($focusService, $serviceIds, true)) {
            $score += 8;
        }
        $packages = $meta['packages'] ?? [];
        $pkg = (string) ($draft['package'] ?? $draft['recommendation']['package'] ?? '');
        if ($pkg !== '' && is_array($packages) && in_array($pkg, $packages, true)) {
            $score += 10;
        }
        return $score;
    }

    /**
     * @param array<string,mixed> $meta
     * @return array<string,mixed>|null
     */
    private function loadCard(array $meta): ?array
    {
        $file = (string) ($meta['file'] ?? '');
        if ($file === '' || str_contains($file, '..')) {
            return null;
        }
        $path = $this->root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $file);
        if (!is_file($path)) {
            return null;
        }
        $decoded = json_decode((string) file_get_contents($path), true);
        return is_array($decoded) ? $decoded : null;
    }

    /**
     * @param array<string,mixed> $meta
     */
    private function loadGuidance(array $meta): ?string
    {
        $file = (string) ($meta['file'] ?? '');
        if ($file === '' || str_contains($file, '..')) {
            return null;
        }
        $path = $this->root . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $file);
        if (!is_file($path)) {
            return null;
        }
        $raw = trim((string) file_get_contents($path));
        if ($raw === '') {
            return null;
        }
        return mb_substr($raw, 0, 1200);
    }

    /**
     * @return array{cards?:list<array<string,mixed>>,guidance?:list<array<string,mixed>>}
     */
    private function manifest(): array
    {
        if ($this->manifest !== null) {
            return $this->manifest;
        }
        $path = $this->root . DIRECTORY_SEPARATOR . 'manifest.json';
        $raw = is_file($path) ? file_get_contents($path) : false;
        $decoded = is_string($raw) ? json_decode($raw, true) : null;
        $this->manifest = is_array($decoded) ? $decoded : ['cards' => [], 'guidance' => []];
        return $this->manifest;
    }
}
