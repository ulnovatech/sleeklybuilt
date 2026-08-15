<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ProductCatalogue;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class CompareProductsTool implements AttendantTool
{
    public function __construct(private ProductCatalogue $catalogue)
    {
    }

    public function name(): string
    {
        return 'compare_products';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Compare 2–3 products of the same kind. Server-built differences; do not invent prices.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'ids' => [
                        'type' => 'array',
                        'items' => ['type' => 'string'],
                    ],
                    'kind' => [
                        'type' => 'string',
                        'enum' => ['orderable_package', 'display_package', 'layout'],
                    ],
                ],
                'required' => ['ids'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $ids = $args['ids'] ?? null;
        if (!is_array($ids)) {
            return ToolResults::fail($this->name(), 'validation_error', 'Provide two or three product ids.');
        }
        $ids = array_values(array_filter(array_map(static fn ($v) => trim((string) $v), $ids)));
        if (count($ids) < 2 || count($ids) > 3) {
            return ToolResults::fail($this->name(), 'validation_error', 'Compare needs two or three products.');
        }

        $kind = isset($args['kind']) ? (string) $args['kind'] : null;
        if ($kind === '') {
            $kind = null;
        }

        $items = [];
        $kinds = [];
        foreach ($ids as $id) {
            $result = $this->catalogue->getProduct($id, $kind);
            if (!$result['ok']) {
                return ToolResults::fail(
                    $this->name(),
                    (string) ($result['code'] ?? 'not_found'),
                    'I could not load one of those products for comparison.'
                );
            }
            $product = $result['product'];
            $items[] = $product;
            $kinds[] = (string) ($product['kind'] ?? '');
        }

        $uniqueKinds = array_values(array_unique($kinds));
        if (count($uniqueKinds) > 1) {
            return ToolResults::fail(
                $this->name(),
                'validation_error',
                'Those products are different kinds (for example display pricing vs checkout packages). Compare within one kind, or say which kind to use.',
                'none',
                ['kinds' => $uniqueKinds, 'ids' => $ids]
            );
        }

        $differences = [];
        $fields = ['title', 'price_ugx', 'deposit_ugx', 'price_label', 'ideal_for', 'orderable', 'cta_path'];
        foreach ($fields as $field) {
            $values = [];
            $any = false;
            foreach ($items as $item) {
                if (array_key_exists($field, $item)) {
                    $any = true;
                    $values[] = $item[$field];
                } else {
                    $values[] = null;
                }
            }
            if ($any && count(array_unique(array_map('serialize', $values))) > 1) {
                $differences[] = ['field' => $field, 'values' => $values];
            }
        }

        return ToolResults::ok($this->name(), [
            'items' => $items,
            'differences' => $differences,
            'kind' => $uniqueKinds[0] ?? null,
        ]);
    }
}
