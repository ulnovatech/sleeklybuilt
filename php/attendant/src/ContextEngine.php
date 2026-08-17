<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Builds structured turn context for PromptComposer placeholders.
 */
final class ContextEngine
{
    public function __construct(private ExpertiseLibrary $expertise = new ExpertiseLibrary())
    {
    }

    /**
     * @param array<string,mixed> $page
     * @param array<string,mixed>|null $draft
     * @param array<string,mixed>|null $pending
     * @param list<array{id:string,title?:string,text?:string,source?:string}> $retrieved
     * @return array{
     *   page_json:string,
     *   visible_json:string,
     *   draft_json:string,
     *   pending_json:string,
     *   company_json:string,
     *   retrieved_json:string,
     *   customer_json:string,
     *   commercial_json:string,
     *   expertise_json:string,
     *   retrieved_ids:list<string>
     * }
     */
    public function build(
        array $page,
        ?array $draft,
        ?array $pending,
        array $retrieved = [],
        string $message = '',
        ?array $choicePending = null
    ): array {
        $normalized = CustomerModel::normalize($draft);
        $visible = [
            'visible_product_id' => $page['visible_product_id'] ?? null,
            'visible_product_kind' => $page['visible_product_kind'] ?? null,
            'visible_service_id' => $page['visible_service_id'] ?? null,
        ];

        $ids = [];
        foreach ($retrieved as $hit) {
            if (isset($hit['id'])) {
                $ids[] = (string) $hit['id'];
            }
        }

        $expertise = $this->expertise->select($page, $normalized, $message);

        $choiceJson = null;
        if ($choicePending !== null) {
            $cp = $choicePending['payload'] ?? $choicePending;
            $choiceJson = [
                'waiting' => true,
                'prompt' => $cp['prompt'] ?? $choicePending['summary'] ?? null,
                'options' => array_map(
                    static fn ($o) => [
                        'id' => is_array($o) ? ($o['id'] ?? null) : null,
                        'label' => is_array($o) ? ($o['label'] ?? null) : null,
                    ],
                    is_array($cp['options'] ?? null) ? $cp['options'] : []
                ),
                'multi' => !empty($cp['multi']),
            ];
        }

        return [
            'page_json' => $this->encode([
                'current_url' => $page['current_url'] ?? '',
                'page_id' => $page['page_id'] ?? 'unknown',
                'section_id' => $page['section_id'] ?? null,
                'path' => $page['path'] ?? null,
                'recent_page_ids' => $page['recent_page_ids'] ?? [],
            ]),
            'visible_json' => $this->encode($visible),
            'draft_json' => $this->encode([
                'service_id' => $normalized['service_id'],
                'product_id' => $normalized['product_id'],
                'product_kind' => $normalized['product_kind'],
                'package' => $normalized['package'],
                'template' => $normalized['template'],
                'business_name' => $normalized['business_name'],
                'notes' => $normalized['notes'],
            ]),
            'pending_json' => $this->encode($pending === null ? null : [
                'tool' => $pending['tool_name'] ?? $pending['tool'] ?? null,
                'summary' => $pending['summary'] ?? $pending['summary_text'] ?? null,
                'waiting' => true,
            ]),
            'choices_json' => $this->encode($choiceJson),
            'company_json' => $this->encode($this->companyRecord()),
            'retrieved_json' => $this->encode($retrieved),
            'customer_json' => $this->encode(CustomerModel::forPrompt($normalized)),
            'commercial_json' => $this->encode([
                'state' => $normalized['commercial_state'],
                'hint' => $this->commercialHint((string) $normalized['commercial_state']),
            ]),
            'expertise_json' => $this->encode($expertise),
            'retrieved_ids' => $ids,
        ];
    }

    /**
     * Contact + positioning facts for handoff and context (not the full company corpus).
     *
     * @return array<string,mixed>
     */
    public function companyRecord(): array
    {
        return [
            'brand_name' => 'SleeklyBuilt',
            'legal_name' => 'SleeklyBuilt',
            'tagline' => 'Websites, apps & systems — built sleek, built right',
            'description' =>
                'SleeklyBuilt crafts custom websites, mobile apps, graphics, and business systems for clients in Uganda and beyond.',
            'email' => 'sales@sleeklybuilt.pro',
            'phones' => ['+256 791779448', '+256 749594464', '+256 772169960'],
            'primary_phone' => '+256791779448',
            'whatsapp_url' => 'https://wa.me/256749594464',
            'location' => 'Kampala, Uganda',
            'address_note' => 'Office under development',
            'policies_index' => '/policies',
            'authority_note' =>
                'Policies and catalogue tools beat improvisation. Prefer get_company_document / search_knowledge for policy facts.',
            'social' => [
                'x' => 'https://x.com/sleeklybuilt',
                'instagram' => 'https://www.instagram.com/sleeklybuilt/?hl=en',
                'linkedin' => 'https://www.linkedin.com/company/sleeklybuilt/',
                'youtube' => 'https://www.youtube.com/@SleeklyBuilt',
            ],
        ];
    }

    private function commercialHint(string $state): string
    {
        return match ($state) {
            CommercialStateMachine::DISCOVERY => 'Learn who they are and what they need. One clarifying question max if blocked.',
            CommercialStateMachine::QUALIFICATION => 'You have enough to start judging fit. Ask only what unblocks a recommendation.',
            CommercialStateMachine::RECOMMENDATION => 'Lead with a clear recommendation and one next step. Do not re-qualify known facts.',
            CommercialStateMachine::AGREEMENT => 'They are aligning. Move toward order/lead with confirmation — no brochure dump.',
            CommercialStateMachine::ORDER => 'Order/quote path is in play. Be precise; use tools.',
            CommercialStateMachine::PAYMENT => 'Payment handoff only via real secure flow — never invent payment success.',
            CommercialStateMachine::COMPLETE => 'Work is complete for this thread unless they open a new need.',
            CommercialStateMachine::ESCALATED => 'Human path is active or needed. Do not fake resolution.',
            default => 'Stay grounded in the customer model.',
        };
    }

    private function encode(mixed $value): string
    {
        $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $json === false ? '{}' : $json;
    }
}
