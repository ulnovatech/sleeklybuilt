<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\CompanyDocumentStore;
use Attendant\ToolContext;
use Attendant\ToolResults;

/**
 * Fetch a single visitor-allowed company/policy document by id or public slug.
 */
final class GetCompanyDocumentTool implements AttendantTool
{
    public function __construct(private CompanyDocumentStore $company = new CompanyDocumentStore())
    {
    }

    public function name(): string
    {
        return 'get_company_document';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' =>
                'Load one visitor-allowed company or public policy document by id or slug '
                . '(e.g. privacy, refund, payment). Never returns internal authority docs.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'id' => ['type' => 'string'],
                    'slug' => ['type' => 'string'],
                ],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $id = trim((string) ($args['id'] ?? ''));
        $slug = trim((string) ($args['slug'] ?? ''));
        if ($id === '' && $slug === '') {
            return ToolResults::fail($this->name(), 'validation_error', 'Provide a document id or slug.');
        }

        $allowed = CompanyDocumentStore::VISITOR_ALLOWED;
        $result = $id !== ''
            ? $this->company->getById($id, $allowed)
            : $this->company->getBySlug($slug, $allowed);

        if (!($result['ok'] ?? false)) {
            $code = (string) ($result['code'] ?? 'not_found');
            if ($code === 'forbidden') {
                $ctx->telemetry?->emit('retrieval_access_denied', [
                    'conversation_id' => $ctx->conversationId,
                    'session_id' => $ctx->sessionId,
                    'page_id' => $ctx->page['page_id'] ?? null,
                    'tool_name' => $this->name(),
                    'tool_ok' => false,
                    'error_code' => 'unauthorized',
                    'meta' => [
                        'requested_id' => $id !== '' ? $id : null,
                        'requested_slug' => $slug !== '' ? $slug : null,
                    ],
                ]);
                return ToolResults::fail(
                    $this->name(),
                    'unauthorized',
                    'That document is not available to share here.'
                );
            }
            return ToolResults::fail($this->name(), 'not_found', 'I could not find that policy document.');
        }

        $doc = $result['document'];
        return ToolResults::ok($this->name(), [
            'id' => $doc['id'],
            'title' => $doc['title'],
            'slug' => $doc['slug'],
            'public_route' => $doc['public_route'],
            'markdown' => $doc['markdown'],
        ]);
    }
}
