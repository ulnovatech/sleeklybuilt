<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ProductCatalogue;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class GetProductTool implements AttendantTool
{
    public function __construct(private ProductCatalogue $catalogue)
    {
    }

    public function name(): string
    {
        return 'get_product';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Fetch a structured product by id. Kinds: orderable_package (basic/smart/premium), display_package, layout.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'id' => ['type' => 'string'],
                    'kind' => [
                        'type' => 'string',
                        'enum' => ['orderable_package', 'display_package', 'layout'],
                    ],
                ],
                'required' => ['id'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $id = trim((string) ($args['id'] ?? ''));
        $kind = isset($args['kind']) ? (string) $args['kind'] : null;
        if ($kind === '') {
            $kind = null;
        }
        $result = $this->catalogue->getProduct($id, $kind);
        if (!$result['ok']) {
            $code = (string) ($result['code'] ?? 'not_found');
            $msg = match ($code) {
                'ambiguous_id' => 'That id matches more than one product type. Ask which kind they mean.',
                'validation_error' => 'I need a product id.',
                default => 'I could not find that product.',
            };
            return ToolResults::fail($this->name(), $code, $msg);
        }
        return ToolResults::ok($this->name(), $result['product']);
    }
}
