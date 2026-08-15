<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Orderable packages from uln_packages(), display packages from JSON, layouts from catalog.
 */
final class ProductCatalogue
{
    /** @var list<array<string,mixed>> */
    private array $display = [];

    public function __construct(?string $knowledgeDir = null)
    {
        $dir = $knowledgeDir ?? (__DIR__ . '/../knowledge');
        $path = $dir . DIRECTORY_SEPARATOR . 'display-packages.json';
        $raw = json_decode((string) file_get_contents($path), true);
        $packages = is_array($raw) ? ($raw['packages'] ?? []) : [];
        foreach ($packages as $pkg) {
            if (is_array($pkg) && isset($pkg['id'])) {
                $this->display[(string) $pkg['id']] = $pkg;
            }
        }

        $packagesPhp = dirname(__DIR__, 2) . '/payments/packages.php';
        if (is_file($packagesPhp)) {
            require_once $packagesPhp;
        }
        $catalogPhp = dirname(__DIR__, 3) . '/portfolio/api/lib/catalog.php';
        if (is_file($catalogPhp)) {
            require_once $catalogPhp;
        }
    }

    /**
     * @return array{ok:bool,product?:array,code?:string,error?:string}
     */
    public function getProduct(string $id, ?string $kind = null): array
    {
        $id = trim($id);
        if ($id === '') {
            return ['ok' => false, 'code' => 'validation_error', 'error' => 'Product id required'];
        }

        if ($kind === 'orderable_package') {
            $p = $this->orderable($id);
            return $p === null
                ? ['ok' => false, 'code' => 'not_found', 'error' => 'Package not found']
                : ['ok' => true, 'product' => $p];
        }
        if ($kind === 'display_package') {
            $p = $this->displayPackage($id);
            return $p === null
                ? ['ok' => false, 'code' => 'not_found', 'error' => 'Package not found']
                : ['ok' => true, 'product' => $p];
        }
        if ($kind === 'layout') {
            $p = $this->layout($id);
            return $p === null
                ? ['ok' => false, 'code' => 'not_found', 'error' => 'Layout not found']
                : ['ok' => true, 'product' => $p];
        }

        $hits = [];
        $o = $this->orderable($id);
        if ($o !== null) {
            $hits[] = $o;
        }
        $d = $this->displayPackage($id);
        if ($d !== null) {
            $hits[] = $d;
        }
        $l = $this->layout($id);
        if ($l !== null) {
            $hits[] = $l;
        }

        if (count($hits) === 0) {
            return ['ok' => false, 'code' => 'not_found', 'error' => 'Product not found'];
        }
        if (count($hits) > 1) {
            return [
                'ok' => false,
                'code' => 'ambiguous_id',
                'error' => 'Id matches multiple product kinds; pass kind',
            ];
        }
        return ['ok' => true, 'product' => $hits[0]];
    }

    /**
     * @return array<string,mixed>|null
     */
    public function orderable(string $id): ?array
    {
        if (!function_exists('uln_packages')) {
            return null;
        }
        $all = uln_packages();
        if (!isset($all[$id]) || !is_array($all[$id])) {
            return null;
        }
        $row = $all[$id];
        return [
            'id' => $id,
            'kind' => 'orderable_package',
            'title' => (string) ($row['title'] ?? $id),
            'price_ugx' => (int) ($row['price_ugx'] ?? 0),
            'deposit_ugx' => (int) ($row['deposit_ugx'] ?? 0),
            'currency' => 'UGX',
            'badge' => $row['badge'] ?? null,
            'orderable' => true,
        ];
    }

    /**
     * @return array<string,mixed>|null
     */
    public function displayPackage(string $id): ?array
    {
        $row = $this->display[$id] ?? null;
        if ($row === null) {
            return null;
        }
        return [
            'id' => $id,
            'kind' => 'display_package',
            'title' => (string) ($row['title'] ?? $id),
            'price_ugx' => $row['price_ugx'] ?? null,
            'price_label' => $row['price_label'] ?? null,
            'ideal_for' => $row['ideal_for'] ?? null,
            'features' => $row['features'] ?? [],
            'orderable' => false,
            'cta_path' => $row['cta_path'] ?? '/contact',
        ];
    }

    /**
     * @return array<string,mixed>|null
     */
    public function layout(string $id): ?array
    {
        if (!function_exists('uln_resolve_template_id') || !function_exists('uln_template_meta')) {
            return null;
        }
        $resolved = uln_resolve_template_id($id);
        if ($resolved === null) {
            return null;
        }
        $meta = uln_template_meta($resolved);
        return [
            'id' => $resolved,
            'kind' => 'layout',
            'title' => (string) ($meta['title'] ?? $resolved),
            'description' => (string) ($meta['description'] ?? ''),
            'collection' => (string) ($meta['collection'] ?? 'websites'),
            'layout_fit' => $meta['layoutFit'] ?? null,
            'business_types' => $meta['businessTypes'] ?? [],
            'orderable' => true,
            'cta_path' => '/portfolio-app/order',
        ];
    }

    /**
     * @return list<string>
     */
    public function orderableIds(): array
    {
        if (!function_exists('uln_packages')) {
            return [];
        }
        return array_keys(uln_packages());
    }
}
