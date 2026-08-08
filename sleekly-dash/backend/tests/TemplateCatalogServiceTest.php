<?php

declare(strict_types=1);

require_once __DIR__ . '/../services/TemplateCatalogService.php';

$catalogPath = TemplateImportPolicy::catalogPath();
$catalogOriginal = (string) file_get_contents($catalogPath);
$lockPath = $catalogPath . '.lock';
$lockExisted = file_exists($lockPath);
$portfolioDirectory = TemplateImportPolicy::portfolioDirectory();
$slug = 'catalog-' . bin2hex(random_bytes(5)) . '.webflow.io';
$directory = $portfolioDirectory . DIRECTORY_SEPARATOR . $slug;

try {
    if (!mkdir($directory, 0755)) {
        throw new RuntimeException('Unable to create catalog test template.');
    }
    file_put_contents(
        $directory . '/index.html',
        '<!doctype html><html><body><script src="/portfolio/portfolio/cta.js" defer></script></body></html>'
    );

    $service = new TemplateCatalogService();
    $updated = $service->update($slug, [
        'title' => 'Catalog Test',
        'description' => 'Atomic catalog metadata validation.',
        'category' => 'test',
        'collection' => 'sleek-pages',
        'aliases' => ['Test Alias', 'test alias', ''],
    ]);
    if (
        $updated['title'] !== 'Catalog Test' ||
        $updated['collection'] !== 'sleek-pages' ||
        $updated['aliases'] !== ['Test Alias']
    ) {
        throw new RuntimeException('Catalog metadata normalization failed.');
    }

    $listing = $service->list();
    $match = array_values(array_filter(
        $listing['items'],
        static fn (array $item): bool => $item['slug'] === $slug
    ));
    if (
        count($match) !== 1 ||
        $match[0]['description'] !== 'Atomic catalog metadata validation.' ||
        ($match[0]['collection'] ?? null) !== 'sleek-pages'
    ) {
        throw new RuntimeException('Catalog listing did not return updated metadata.');
    }

    fwrite(STDOUT, "Template catalog list and metadata update passed.\n");
} finally {
    @unlink($directory . '/index.html');
    @rmdir($directory);

    $lock = fopen($lockPath, 'c+');
    if ($lock !== false && flock($lock, LOCK_EX)) {
        $temporary = dirname($catalogPath) . '/.catalog-service-test-' . bin2hex(random_bytes(4));
        file_put_contents($temporary, $catalogOriginal, LOCK_EX);
        rename($temporary, $catalogPath);
        flock($lock, LOCK_UN);
        fclose($lock);
    }
    if (!$lockExisted) {
        @unlink($lockPath);
    }
}
