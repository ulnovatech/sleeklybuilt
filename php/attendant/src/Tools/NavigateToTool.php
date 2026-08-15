<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\PageRegistry;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class NavigateToTool implements AttendantTool
{
    public function __construct(private PageRegistry $registry)
    {
    }

    public function name(): string
    {
        return 'navigate_to';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Resolve a semantic page (and optional section) to a path/hash for the widget. Never invent URLs.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'page_id' => [
                        'type' => 'string',
                        'description' => 'Registry page_id (e.g. prices, websites, contact)',
                    ],
                    'section_id' => [
                        'type' => 'string',
                        'description' => 'Optional section on that page',
                    ],
                ],
                'required' => ['page_id'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $pageId = trim((string) ($args['page_id'] ?? ''));
        $sectionId = isset($args['section_id']) ? trim((string) $args['section_id']) : null;
        if ($sectionId === '') {
            $sectionId = null;
        }
        if ($pageId === '' || !preg_match('/^[a-z0-9-]+$/', $pageId)) {
            return ToolResults::fail($this->name(), 'unknown_destination', 'I could not find that page.');
        }
        if ($sectionId !== null && !preg_match('/^[a-z0-9-]+$/', $sectionId)) {
            return ToolResults::fail($this->name(), 'unknown_destination', 'I could not find that section.');
        }

        $resolved = $this->registry->resolveNavigate($pageId, $sectionId);
        if ($resolved === null) {
            return ToolResults::fail($this->name(), 'unknown_destination', 'I could not find that page.');
        }

        return ToolResults::ok($this->name(), $resolved, 'client_navigation');
    }
}
