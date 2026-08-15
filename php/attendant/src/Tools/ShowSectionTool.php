<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\PageRegistry;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class ShowSectionTool implements AttendantTool
{
    public function __construct(private PageRegistry $registry)
    {
    }

    public function name(): string
    {
        return 'show_section';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Resolve a section highlight (scroll + outline). Defaults to the current page when possible.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'section_id' => ['type' => 'string'],
                    'page_id' => ['type' => 'string'],
                ],
                'required' => ['section_id'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $sectionId = trim((string) ($args['section_id'] ?? ''));
        $pageId = isset($args['page_id']) ? trim((string) $args['page_id']) : null;
        if ($pageId === null || $pageId === '') {
            $pageId = isset($ctx->page['page_id']) ? (string) $ctx->page['page_id'] : null;
        }
        if ($sectionId === '' || !preg_match('/^[a-z0-9-]+$/', $sectionId)) {
            return ToolResults::fail($this->name(), 'unknown_section', 'I could not find that section.');
        }

        $resolved = $this->registry->resolveShowSection($sectionId, $pageId);
        if ($resolved === null) {
            return ToolResults::fail($this->name(), 'unknown_section', 'I could not find that section.');
        }

        return ToolResults::ok($this->name(), $resolved, 'client_navigation');
    }
}
