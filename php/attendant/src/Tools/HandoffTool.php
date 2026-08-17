<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\CommercialStateMachine;
use Attendant\ContextEngine;
use Attendant\ConversationStore;
use Attendant\CustomerModel;
use Attendant\EscalationPolicy;
use Attendant\EscalationState;
use Attendant\ToolContext;
use Attendant\ToolResults;

/**
 * Escalation handoff: returns public channels and writes operator brief + escalation state.
 */
final class HandoffTool implements AttendantTool
{
    public function __construct(
        private ContextEngine $context,
        private ?ConversationStore $store = null
    ) {
    }

    public function name(): string
    {
        return 'handoff';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' =>
                'Escalate to a human path. Requires reason_code from the allowed list. '
                . 'Returns WhatsApp/phone/email and records an operator brief. Not a default CTA.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'reason_code' => [
                        'type' => 'string',
                        'description' =>
                            'explicit_human | knowledge_failure | authority_breach | legal_dispute | '
                            . 'high_consequence | repeated_failure | safety',
                    ],
                    'reason' => [
                        'type' => 'string',
                        'description' => 'Short operator-facing note',
                    ],
                    'suggested_next_action' => ['type' => 'string'],
                ],
                'required' => ['reason_code'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $pageHint = (string) ($ctx->page['current_url'] ?? '');
        $gate = EscalationPolicy::validateHandoffArgs($args, $pageHint . ' ' . (string) ($args['reason'] ?? ''));
        if (!$gate['ok']) {
            return ToolResults::fail(
                $this->name(),
                'escalation_not_allowed',
                $gate['error'] ?? 'That does not need a human handoff yet.'
            );
        }
        /** @var string $reasonCode */
        $reasonCode = $gate['code'];

        $contact = $this->loadPublicContact($ctx->pdo);
        if ($contact === null) {
            $company = $this->context->companyRecord();
            $contact = [
                'whatsapp_url' => $company['whatsapp_url'] ?? null,
                'primary_phone' => $company['primary_phone'] ?? null,
                'email' => $company['email'] ?? null,
                'phones' => $company['phones'] ?? [],
            ];
        }

        if (empty($contact['email']) && empty($contact['whatsapp_url']) && empty($contact['primary_phone'])) {
            return ToolResults::fail($this->name(), 'backend_error', 'I couldn\'t load contact details just now.');
        }

        $draft = $this->store?->getDraft($ctx->conversationId);
        $normalized = CustomerModel::normalize($draft);
        $brief = $this->buildBrief($normalized, $reasonCode, $args, $ctx->page);

        if ($this->store !== null) {
            $this->store->setEscalationState(
                $ctx->conversationId,
                EscalationState::ESCALATED,
                $brief
            );
            $merged = CustomerModel::merge($normalized, [
                'commercial_state' => CommercialStateMachine::ESCALATED,
                'known_facts' => ['escalated:' . $reasonCode],
            ]);
            $this->store->saveDraft($ctx->conversationId, $merged);
            $this->store->addMessage(
                $ctx->conversationId,
                'system',
                'Connecting you with the team… A specialist will continue here shortly. WhatsApp remains available if you prefer.',
                'handoff',
                true,
                'escalation-notice-' . $ctx->conversationId
            );
        }

        $this->dispatchEscalationPush($ctx->conversationId, $brief, $reasonCode);

        return ToolResults::ok($this->name(), [
            'whatsapp_url' => $contact['whatsapp_url'] ?? null,
            'primary_phone' => $contact['primary_phone'] ?? null,
            'email' => $contact['email'] ?? null,
            'phones' => $contact['phones'] ?? [],
            'reason_code' => $reasonCode,
            'reason' => isset($args['reason']) ? mb_substr(trim((string) $args['reason']), 0, 400) : null,
            'escalation_state' => EscalationState::ESCALATED,
            'operator_brief' => $brief,
            'channels_only' => true,
        ]);
    }

    /**
     * @param array<string,mixed> $draft
     * @param array<string,mixed> $args
     * @param array<string,mixed> $page
     * @return array<string,mixed>
     */
    private function buildBrief(array $draft, string $reasonCode, array $args, array $page): array
    {
        $cm = is_array($draft['customer_model'] ?? null) ? $draft['customer_model'] : [];
        $rec = is_array($draft['recommendation'] ?? null) ? $draft['recommendation'] : [];
        $orgName = $cm['org_name'] ?? $draft['business_name'] ?? null;
        $objective = $cm['objective'] ?? null;
        $package = $rec['package'] ?? $draft['package'] ?? null;
        $service = $rec['service_id'] ?? $draft['service_id'] ?? null;

        $summaryParts = [];
        if ($orgName) {
            $summaryParts[] = (string) $orgName;
        }
        if ($cm['org_type'] ?? null) {
            $summaryParts[] = (string) $cm['org_type'];
        }
        if ($objective) {
            $summaryParts[] = 'wants ' . (string) $objective;
        }
        if ($package || $service) {
            $summaryParts[] = 'leaning ' . (string) ($package ?: $service);
        }
        $summary = $summaryParts !== []
            ? mb_substr(implode(' · ', $summaryParts), 0, 280)
            : 'Visitor requested human help (' . $reasonCode . ').';

        $requirements = [];
        foreach (['matters', 'constraints'] as $key) {
            if (!empty($cm[$key]) && is_array($cm[$key])) {
                foreach ($cm[$key] as $item) {
                    if (is_string($item) && $item !== '') {
                        $requirements[] = $item;
                    }
                }
            }
        }
        $decisions = [];
        foreach ($draft['known_facts'] ?? [] as $fact) {
            if (is_string($fact) && (str_starts_with($fact, 'chose:') || str_starts_with($fact, 'package='))) {
                $decisions[] = $fact;
            }
        }

        return [
            'reason_code' => $reasonCode,
            'reason' => isset($args['reason']) ? mb_substr(trim((string) $args['reason']), 0, 400) : null,
            'suggested_next_action' => isset($args['suggested_next_action'])
                ? mb_substr(trim((string) $args['suggested_next_action']), 0, 240)
                : 'Open the attendant thread, take over, and reply with context from this brief.',
            'summary' => $summary,
            'requirements' => array_values(array_unique(array_slice($requirements, 0, 8))),
            'decisions' => array_values(array_slice($decisions, 0, 8)),
            'unresolved' => array_values(array_slice(
                is_array($draft['open_questions'] ?? null) ? $draft['open_questions'] : [],
                0,
                8
            )),
            'customer' => [
                'who' => $cm['who'] ?? null,
                'org_type' => $cm['org_type'] ?? null,
                'org_name' => $orgName,
                'objective' => $objective,
                'why' => $cm['why'] ?? null,
                'worries' => $cm['worries'] ?? [],
                'constraints' => $cm['constraints'] ?? [],
            ],
            'recommendation' => [
                'service_id' => $service,
                'package' => $package,
                'label' => $rec['label'] ?? null,
                'rationale' => $rec['rationale'] ?? null,
            ],
            'order_package' => $package,
            'page' => [
                'page_id' => $page['page_id'] ?? null,
                'path' => $page['path'] ?? null,
                'current_url' => $page['current_url'] ?? null,
            ],
            'open_questions' => $draft['open_questions'] ?? [],
            'known_facts' => $draft['known_facts'] ?? [],
            'commercial_state' => CommercialStateMachine::ESCALATED,
        ];
    }

    /**
     * @param array<string,mixed> $brief
     */
    private function dispatchEscalationPush(string $conversationId, array $brief, string $reasonCode): void
    {
        try {
            $notify = dirname(__DIR__, 3) . '/leads/push_notify.php';
            if (!is_file($notify)) {
                return;
            }
            require_once $notify;
            if (!function_exists('uln_dispatch_lead_push')) {
                return;
            }
            $customer = is_array($brief['customer'] ?? null) ? $brief['customer'] : [];
            $name = trim((string) ($customer['org_name'] ?? $customer['who'] ?? ''));
            if ($name === '') {
                $name = 'Attendant escalation';
            }
            uln_dispatch_lead_push('attendant_escalation', [
                'source_id' => $conversationId,
                'name' => $name,
                'reason_code' => $reasonCode,
                'summary' => (string) ($brief['summary'] ?? ''),
            ]);
        } catch (\Throwable $e) {
            error_log('Attendant escalation push failed: ' . $e->getMessage());
        }
    }

    /**
     * @return array<string,mixed>|null
     */
    private function loadPublicContact(?\PDO $pdo): ?array
    {
        if (!$pdo instanceof \PDO) {
            return null;
        }
        try {
            $stmt = $pdo->query(
                'SELECT email, phones_json, primary_phone, whatsapp_url
                 FROM site_contact_settings WHERE id = 1 LIMIT 1'
            );
            $row = $stmt ? $stmt->fetch() : false;
            if (!$row) {
                return null;
            }
            $phones = json_decode((string) ($row['phones_json'] ?? '[]'), true);
            return [
                'email' => $row['email'] ?? null,
                'primary_phone' => $row['primary_phone'] ?? null,
                'whatsapp_url' => $row['whatsapp_url'] ?? null,
                'phones' => is_array($phones) ? $phones : [],
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }
}
