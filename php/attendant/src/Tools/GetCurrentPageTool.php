<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class GetCurrentPageTool implements AttendantTool
{
    public function name(): string
    {
        return 'get_current_page';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Return the visitor page context already sent by the client (normalized).',
            'parameters' => [
                'type' => 'object',
                'properties' => new \stdClass(),
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $page = $ctx->page;
        return ToolResults::ok($this->name(), [
            'page_id' => $page['page_id'] ?? 'unknown',
            'path' => $page['path'] ?? null,
            'section_id' => $page['section_id'] ?? null,
            'visible_product_id' => $page['visible_product_id'] ?? null,
            'visible_service_id' => $page['visible_service_id'] ?? null,
            'recent_page_ids' => $page['recent_page_ids'] ?? [],
        ]);
    }
}
