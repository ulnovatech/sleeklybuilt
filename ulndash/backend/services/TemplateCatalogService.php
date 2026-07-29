<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/TemplateImportPolicy.php';

final class TemplateCatalogService
{
    /**
     * @return array{items:array<int,array<string,mixed>>,total:int}
     */
    public function list(): array
    {
        $catalog = $this->readCatalog();
        $portfolioDirectory = TemplateImportPolicy::portfolioDirectory();
        $items = [];

        foreach (scandir($portfolioDirectory) ?: [] as $slug) {
            if (
                $slug === '.' ||
                $slug === '..' ||
                str_starts_with($slug, '.') ||
                !$this->isSafeSlug($slug)
            ) {
                continue;
            }
            $directory = $portfolioDirectory . DIRECTORY_SEPARATOR . $slug;
            if (!is_dir($directory) || !is_file($directory . DIRECTORY_SEPARATOR . 'index.html')) {
                continue;
            }

            $meta = is_array($catalog[$slug] ?? null) ? $catalog[$slug] : [];
            $items[] = [
                'slug' => $slug,
                'title' => trim((string) ($meta['title'] ?? '')) !== ''
                    ? (string) $meta['title']
                    : $this->titleFromSlug($slug),
                'description' => trim((string) ($meta['description'] ?? '')) !== ''
                    ? (string) $meta['description']
                    : '',
                'category' => (string) ($meta['category'] ?? 'uncategorized'),
                'aliases' => $this->normalizeAliases($meta['aliases'] ?? []),
                'entry' => '/portfolio/portfolio/' . rawurlencode($slug) . '/',
                'updated_at' => gmdate(
                    DATE_ATOM,
                    (int) (filemtime($directory . DIRECTORY_SEPARATOR . 'index.html') ?: time())
                ),
            ];
        }

        usort(
            $items,
            static fn (array $left, array $right): int =>
                strcasecmp((string) $left['title'], (string) $right['title'])
        );

        return ['items' => $items, 'total' => count($items)];
    }

    /**
     * @param array<string,mixed> $input
     * @return array<string,mixed>
     */
    public function update(string $slug, array $input): array
    {
        if (!$this->isSafeSlug($slug)) {
            throw new InvalidArgumentException('Invalid template slug.', 422);
        }
        $directory = TemplateImportPolicy::portfolioDirectory() . DIRECTORY_SEPARATOR . $slug;
        if (!is_dir($directory) || !is_file($directory . DIRECTORY_SEPARATOR . 'index.html')) {
            throw new RuntimeException('Published template not found.', 404);
        }

        $title = $this->requiredText($input, 'title', 160);
        $description = $this->requiredText($input, 'description', 5000);
        $category = $this->requiredText($input, 'category', 100);
        if (!is_array($input['aliases'] ?? [])) {
            throw new InvalidArgumentException('Aliases must be an array.', 422);
        }
        $aliases = $this->normalizeAliases($input['aliases']);
        if (count($aliases) > 20) {
            throw new InvalidArgumentException('A template may have at most 20 aliases.', 422);
        }

        $catalogPath = TemplateImportPolicy::catalogPath();
        $lock = fopen($catalogPath . '.lock', 'c+');
        if ($lock === false || !flock($lock, LOCK_EX)) {
            throw new RuntimeException('Unable to lock the template catalog.', 503);
        }

        try {
            $catalog = $this->readCatalog();
            $catalog[$slug] = [
                'title' => $title,
                'description' => $description,
                'category' => $category,
                'aliases' => $aliases,
            ];
            ksort($catalog, SORT_NATURAL | SORT_FLAG_CASE);
            $this->writeCatalog($catalogPath, $catalog);
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }

        return [
            'slug' => $slug,
            'title' => $title,
            'description' => $description,
            'category' => $category,
            'aliases' => $aliases,
            'entry' => '/portfolio/portfolio/' . rawurlencode($slug) . '/',
        ];
    }

    /**
     * @return array<string,mixed>
     */
    private function readCatalog(): array
    {
        $raw = file_get_contents(TemplateImportPolicy::catalogPath());
        if (!is_string($raw)) {
            throw new RuntimeException('Unable to read the template catalog.');
        }
        $catalog = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($catalog)) {
            throw new RuntimeException('Template catalog is not a JSON object.');
        }

        return $catalog;
    }

    /**
     * @param array<string,mixed> $catalog
     */
    private function writeCatalog(string $path, array $catalog): void
    {
        $temporary = dirname($path) .
            DIRECTORY_SEPARATOR .
            '.catalog-edit-' . bin2hex(random_bytes(6)) . '.tmp';
        $json = json_encode(
            $catalog,
            JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        ) . PHP_EOL;
        if (file_put_contents($temporary, $json, LOCK_EX) === false) {
            throw new RuntimeException('Unable to write the template catalog.');
        }
        @chmod($temporary, 0644);
        if (!rename($temporary, $path)) {
            @unlink($temporary);
            throw new RuntimeException('Unable to atomically update the template catalog.');
        }
    }

    /**
     * @param array<string,mixed> $input
     */
    private function requiredText(array $input, string $key, int $maxLength): string
    {
        $value = trim((string) ($input[$key] ?? ''));
        if ($value === '') {
            throw new InvalidArgumentException(ucfirst($key) . ' is required.', 422);
        }
        if (mb_strlen($value) > $maxLength) {
            throw new InvalidArgumentException(
                ucfirst($key) . " must be {$maxLength} characters or fewer.",
                422
            );
        }

        return $value;
    }

    /**
     * @return array<int,string>
     */
    private function normalizeAliases(mixed $aliases): array
    {
        if (!is_array($aliases)) {
            return [];
        }
        $normalized = [];
        foreach ($aliases as $alias) {
            $value = trim((string) $alias);
            if ($value === '' || mb_strlen($value) > 160) {
                continue;
            }
            $key = mb_strtolower($value);
            if (!isset($normalized[$key])) {
                $normalized[$key] = $value;
            }
        }

        return array_values($normalized);
    }

    private function isSafeSlug(string $slug): bool
    {
        return preg_match('/\A[a-z0-9][a-z0-9._-]{0,252}\z/D', $slug) === 1;
    }

    private function titleFromSlug(string $slug): string
    {
        $title = preg_replace('/\.webflow\.io\z/i', '', $slug) ?? $slug;
        $title = str_replace(['-', '_'], ' ', $title);

        return ucwords(trim(preg_replace('/\s+/', ' ', $title) ?? $title));
    }
}
