<?php

declare(strict_types=1);

/**
 * HTTP-less smoke: exercise the same filter branch as portfolios.php.
 */

require_once __DIR__ . '/../../../portfolio/api/lib/catalog.php';

function collectTemplates(?string $collectionFilter): array
{
    $templates = [];
    $portfolioDir = uln_portfolio_dir();
    foreach (array_diff(scandir($portfolioDir) ?: [], ['.', '..']) as $dir) {
        $fullPath = $portfolioDir . '/' . $dir;
        if (!is_dir($fullPath) || $dir[0] === '.') {
            continue;
        }
        $meta = uln_template_meta($dir);
        if ($collectionFilter !== null && $meta['collection'] !== $collectionFilter) {
            continue;
        }
        $templates[] = [
            'name' => $dir,
            'collection' => $meta['collection'],
        ];
    }

    return $templates;
}

$websites = collectTemplates('websites');
$sleek = collectTemplates('sleek-pages');
$all = collectTemplates(null);

if (count($websites) < 1) {
    fwrite(STDERR, "FAIL: expected websites layouts\n");
    exit(1);
}
if (count($sleek) !== 0) {
    fwrite(STDERR, "FAIL: sleek-pages should be empty until Phase 6 imports\n");
    exit(1);
}
if (count($all) < count($websites)) {
    fwrite(STDERR, "FAIL: unfiltered catalog should include websites\n");
    exit(1);
}
if (uln_normalize_collection('nope') !== null) {
    fwrite(STDERR, "FAIL: invalid collection should normalize to null\n");
    exit(1);
}

fwrite(
    STDOUT,
    sprintf(
        "portfolios collection filter OK (all=%d, websites=%d, sleek-pages=%d).\n",
        count($all),
        count($websites),
        count($sleek)
    )
);
