<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ConversationStore;
use Attendant\CustomerModel;
use Attendant\ToolContext;
use Attendant\ToolResults;

/**
 * Persist visitor/situation facts into the conversation customer model.
 */
final class UpdateCustomerModelTool implements AttendantTool
{
    public function __construct(private ConversationStore $store)
    {
    }

    public function name(): string
    {
        return 'update_customer_model';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' =>
                'Save what you learned about the visitor (org type, objective, worries, chosen package). '
                . 'Call when they state lasting facts so you do not re-ask next turn.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'who' => ['type' => 'string'],
                    'org_type' => ['type' => 'string'],
                    'org_name' => ['type' => 'string'],
                    'objective' => ['type' => 'string'],
                    'why' => ['type' => 'string'],
                    'matters' => ['type' => 'array', 'items' => ['type' => 'string']],
                    'worries' => ['type' => 'array', 'items' => ['type' => 'string']],
                    'constraints' => ['type' => 'array', 'items' => ['type' => 'string']],
                    'service_id' => ['type' => 'string'],
                    'package' => ['type' => 'string'],
                    'business_name' => ['type' => 'string'],
                    'recommendation_label' => ['type' => 'string'],
                    'recommendation_rationale' => ['type' => 'string'],
                    'next_step' => ['type' => 'string'],
                    'commercial_state' => ['type' => 'string'],
                    'open_questions' => ['type' => 'array', 'items' => ['type' => 'string']],
                    'known_facts' => ['type' => 'array', 'items' => ['type' => 'string']],
                ],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $existing = $this->store->getDraft($ctx->conversationId);
        $patch = [];

        $cm = [];
        foreach (['who', 'org_type', 'org_name', 'objective', 'why'] as $key) {
            if (isset($args[$key]) && is_string($args[$key]) && trim($args[$key]) !== '') {
                $cm[$key] = trim($args[$key]);
            }
        }
        foreach (['matters', 'worries', 'constraints'] as $key) {
            if (isset($args[$key]) && is_array($args[$key])) {
                $cm[$key] = $args[$key];
            }
        }
        if ($cm !== []) {
            $patch['customer_model'] = $cm;
        }

        foreach (['service_id', 'package', 'business_name', 'commercial_state'] as $key) {
            if (isset($args[$key]) && is_string($args[$key]) && trim($args[$key]) !== '') {
                $patch[$key] = trim($args[$key]);
            }
        }

        $rec = [];
        if (isset($args['package']) && is_string($args['package'])) {
            $rec['package'] = trim($args['package']);
        }
        if (isset($args['service_id']) && is_string($args['service_id'])) {
            $rec['service_id'] = trim($args['service_id']);
        }
        if (isset($args['recommendation_label']) && is_string($args['recommendation_label'])) {
            $rec['label'] = trim($args['recommendation_label']);
        }
        if (isset($args['recommendation_rationale']) && is_string($args['recommendation_rationale'])) {
            $rec['rationale'] = trim($args['recommendation_rationale']);
        }
        if (isset($args['next_step']) && is_string($args['next_step'])) {
            $rec['next_step'] = trim($args['next_step']);
        }
        if ($rec !== []) {
            $patch['recommendation'] = $rec;
        }

        if (isset($args['open_questions']) && is_array($args['open_questions'])) {
            $patch['open_questions'] = $args['open_questions'];
        }
        if (isset($args['known_facts']) && is_array($args['known_facts'])) {
            $patch['known_facts'] = $args['known_facts'];
        }

        if ($patch === []) {
            return ToolResults::fail($this->name(), 'validation_error', 'Nothing to update.');
        }

        $merged = CustomerModel::merge($existing, $patch);
        $this->store->saveDraft($ctx->conversationId, $merged);

        return ToolResults::ok($this->name(), [
            'draft' => $merged,
            'customer_view' => CustomerModel::forPrompt($merged),
        ]);
    }
}
