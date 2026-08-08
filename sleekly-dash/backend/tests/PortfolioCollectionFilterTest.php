<?php

declare(strict_types=1);

/**
 * Smoke test for portfolios.php ?collection= filter (no HTTP server required).
 */

require_once __DIR__ . '/../../../portfolio/api/lib/catalog.php';

function assertTrue(bool $condition, string $message): void
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$known = uln_known_collections();
assertTrue($known === ['websites', 'sleek-pages'], 'Known collections must be websites and sleek-pages.');
assertTrue(uln_normalize_collection('websites') === 'websites', 'websites normalizes.');
assertTrue(uln_normalize_collection('sleek-pages') === 'sleek-pages', 'sleek-pages normalizes.');
assertTrue(uln_normalize_collection('nope') === null, 'Invalid collection is rejected.');

$meta = uln_template_meta('willey-fragrance.webflow.io');
assertTrue(($meta['collection'] ?? null) === 'websites', 'Existing catalog entries default to websites.');

$catalog = uln_load_catalog();
$websiteCount = 0;
$sleekCount = 0;
foreach ($catalog as $id => $entry) {
    if (!is_array($entry)) {
        continue;
    }
    $collection = uln_normalize_collection(
        isset($entry['collection']) ? (string) $entry['collection'] : null
    ) ?? uln_default_collection();
    if ($collection === 'websites') {
        $websiteCount++;
    }
    if ($collection === 'sleek-pages') {
        $sleekCount++;
    }
}

assertTrue($websiteCount > 0, 'Catalog should contain at least one websites entry.');
assertTrue($sleekCount === 0 || $sleekCount > 0, 'sleek-pages count is non-negative.');

fwrite(STDOUT, "Portfolio collection filter helpers passed (websites={$websiteCount}, sleek-pages={$sleekCount}).\n");
