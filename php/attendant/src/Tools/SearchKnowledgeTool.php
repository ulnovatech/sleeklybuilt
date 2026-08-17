<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\CompanyDocumentStore;
use Attendant\KnowledgeCorpus;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class SearchKnowledgeTool implements AttendantTool
{
    public function __construct(
        private KnowledgeCorpus $corpus,
        private CompanyDocumentStore $company = new CompanyDocumentStore()
    ) {
    }

    public function name(): string
    {
        return 'search_knowledge';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' =>
                'Search curated FAQ and visitor-allowed company/policy documents. '
                . 'Do not use for orderable package prices. Internal/operator docs are never returned.',
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
        $limit = max(1, min(6, $limit));

        $faqHits = $this->corpus->search($query, $limit);
        $companyHits = $this->company->search($query, CompanyDocumentStore::VISITOR_ALLOWED, $limit);

        $merged = [];
        foreach (array_merge($companyHits, $faqHits) as $hit) {
            $id = (string) ($hit['id'] ?? '');
            if ($id === '' || isset($merged[$id])) {
                continue;
            }
            if ($this->company->isVisitorDeniedId($id)) {
                continue;
            }
            $merged[$id] = [
                'id' => $id,
                'title' => (string) ($hit['title'] ?? ''),
                'text' => (string) ($hit['text'] ?? ''),
                'source' => (string) ($hit['source'] ?? ''),
                'public_route' => $hit['public_route'] ?? null,
            ];
        }

        $hits = array_slice(array_values($merged), 0, $limit);
        return ToolResults::ok($this->name(), ['hits' => $hits]);
    }
}
