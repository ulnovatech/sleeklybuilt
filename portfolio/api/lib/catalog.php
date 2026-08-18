<?php
/**
 * Template catalog — folder name is the stable ID; titles live in catalog.json.
 *
 * Product-line `collection` (websites | sleek-pages) is distinct from industry
 * `category` (food, business, …).
 */

function uln_portfolio_dir(): string
{
    return realpath(__DIR__ . '/../../portfolio') ?: (__DIR__ . '/../../portfolio');
}

function uln_catalog_path(): string
{
    return uln_portfolio_dir() . '/catalog.json';
}

/** @return list<string> */
function uln_known_collections(): array
{
    return ['websites', 'sleek-pages'];
}

function uln_default_collection(): string
{
    return 'websites';
}

function uln_normalize_collection(?string $value): ?string
{
    if ($value === null) {
        return null;
    }
    $collection = strtolower(trim($value));
    if ($collection === '' || !in_array($collection, uln_known_collections(), true)) {
        return null;
    }

    return $collection;
}

/**
 * @return array<string, array{title?:string,description?:string,category?:string,collection?:string,aliases?:string[]}>
 */
function uln_load_catalog(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $path = uln_catalog_path();
    if (!is_file($path)) {
        $cache = [];
        return $cache;
    }

    $raw = file_get_contents($path);
    $data = json_decode($raw ?: '[]', true);
    $cache = is_array($data) ? $data : [];
    return $cache;
}

/**
 * Resolve a request slug (folder id or human alias) to the canonical folder name.
 */
function uln_resolve_template_id(string $slug): ?string
{
    $slug = trim($slug);
    if ($slug === '' || str_contains($slug, '..') || str_contains($slug, '/') || str_contains($slug, '\\')) {
        return null;
    }

    $dir = uln_portfolio_dir();
    if (is_dir($dir . '/' . $slug)) {
        return $slug;
    }

    $catalog = uln_load_catalog();
    $needle = mb_strtolower($slug);

    foreach ($catalog as $id => $meta) {
        if (!is_array($meta)) {
            continue;
        }
        if (mb_strtolower((string) $id) === $needle) {
            return is_dir($dir . '/' . $id) ? $id : null;
        }
        if (isset($meta['title']) && mb_strtolower((string) $meta['title']) === $needle) {
            return is_dir($dir . '/' . $id) ? $id : null;
        }
        foreach ($meta['aliases'] ?? [] as $alias) {
            if (mb_strtolower((string) $alias) === $needle) {
                return is_dir($dir . '/' . $id) ? $id : null;
            }
        }
    }

    return null;
}

/**
 * @return array{title:string,description:string,category:?string,collection:string,layoutFit:?string,businessTypes:list<string>}
 */
function uln_template_meta(string $folderId): array
{
    $catalog = uln_load_catalog();
    $meta = $catalog[$folderId] ?? [];

    $fallbackTitle = ucwords(str_replace(['-', '_', '.webflow.io', '-template'], ' ', $folderId));
    $fallbackTitle = preg_replace('/\s+/', ' ', trim($fallbackTitle)) ?: $folderId;

    $collection = uln_normalize_collection(
        isset($meta['collection']) ? (string) $meta['collection'] : null
    ) ?? uln_default_collection();

    $businessTypes = [];
    if (isset($meta['businessTypes']) && is_array($meta['businessTypes'])) {
        foreach ($meta['businessTypes'] as $type) {
            if (!is_string($type)) {
                continue;
            }
            $normalized = strtolower(trim($type));
            if ($normalized !== '') {
                $businessTypes[] = $normalized;
            }
        }
        $businessTypes = array_values(array_unique($businessTypes));
    }

    $layoutFit = isset($meta['layoutFit']) ? strtolower(trim((string) $meta['layoutFit'])) : '';
    if ($layoutFit === '') {
        $layoutFit = null;
    }

    return [
        'title' => trim((string) ($meta['title'] ?? '')) !== '' ? (string) $meta['title'] : $fallbackTitle,
        'description' => trim((string) ($meta['description'] ?? '')) !== ''
            ? (string) $meta['description']
            : 'A professionally designed layout.',
        'category' => isset($meta['category']) ? (string) $meta['category'] : null,
        'collection' => $collection,
        'layoutFit' => $layoutFit,
        'businessTypes' => $businessTypes,
    ];
}

/**
 * Whether a file under images/ is a gallery page shot (not product media).
 */
function uln_is_gallery_shot(string $filename): bool
{
    $base = strtolower(basename($filename));
    $ext = strtolower(pathinfo($base, PATHINFO_EXTENSION));
    if (!in_array($ext, ['png', 'jpg', 'jpeg', 'webp', 'gif'], true)) {
        return false;
    }

    if ($base === 'main.png') {
        return true;
    }

    // Legacy Windows Snipping Tool dumps.
    if (str_starts_with($base, 'screenshot')) {
        return true;
    }

    // Webflow marketplace marketing dumps and mixed product media.
    if (str_contains($base, '___') || str_contains($base, ' webflow ')) {
        return false;
    }
    if (in_array($ext, ['jfif', 'webp'], true) && $base !== 'main.webp') {
        return false;
    }
    if (preg_match('/\A(kit|ty|lapi|911|shoee|hero|product)[_-]?\d*\./', $base) === 1) {
        return false;
    }

    // Auto-capture names: about.png, about_us.png, shop.png, contact_us.png, …
    if ($ext === 'png' && preg_match('/\A[a-z0-9_]{2,64}\.png\z/', $base) === 1) {
        foreach ([
            'not_found', '404', '401', 'protected_page', 'protected', 'licenses', 'license',
            'style_guide', 'styleguide', 'changelog', 'change_log', 'signin', 'signup',
            'reset_password', 'checkout', 'cart',
        ] as $blocked) {
            if ($base === $blocked . '.png' || str_starts_with($base, $blocked . '_')) {
                return false;
            }
        }
        return true;
    }

    return false;
}

/**
 * @param list<string> $urls Absolute or root-relative image URLs
 * @return list<string>
 */
function uln_order_gallery_shots(array $urls): array
{
    $urls = array_values(array_filter($urls, static function ($url) {
        return is_string($url) && $url !== '' && uln_is_gallery_shot(basename(parse_url($url, PHP_URL_PATH) ?: $url));
    }));

    usort($urls, static function (string $a, string $b): int {
        $ba = basename(parse_url($a, PHP_URL_PATH) ?: $a);
        $bb = basename(parse_url($b, PHP_URL_PATH) ?: $b);
        if ($ba === 'main.png') {
            return -1;
        }
        if ($bb === 'main.png') {
            return 1;
        }
        return strnatcasecmp($ba, $bb);
    });

    return $urls;
}
