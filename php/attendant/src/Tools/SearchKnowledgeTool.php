<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\KnowledgeCorpus;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class SearchKnowledgeTool implements AttendantTool
{
    public function __construct(private KnowledgeCorpus $corpus)
    {
    }

    public function name(): string
    {
        return 'search_knowledge';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Search curated FAQ and explanatory copy. Do not use for orderable package prices.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'query' => ['type' => 'string'],
                    'limit' => ['type' => 'integer'],
                ],
                'required' => ['query'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $query = trim((string) ($args['query'] ?? ''));
        if ($query === '' || mb_strlen($query) > 200) {
            return ToolResults::fail($this->name(), 'validation_error', 'Please rephrase that question.');
        }
        $limit = isset($args['limit']) ? (int) $args['limit'] : 4;
        $hits = $this->corpus->search($query, $limit);
        return ToolResults::ok($this->name(), ['hits' => $hits]);
    }
}
