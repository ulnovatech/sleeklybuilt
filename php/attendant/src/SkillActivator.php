<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Deterministic skill selection — never calls the model.
 * Cap keeps the composed prompt small (OPERATING_MODEL.md).
 */
final class SkillActivator
{
    private const ALWAYS = [
        'understand_intent',
        'answer_question',
        'recover_conversation',
    ];

    private const MAX_SKILLS = 8;

    /**
     * @param array<string,mixed> $page
     * @return list<string>
     */
    public function activate(string $message, array $page, bool $hasPendingConfirmation = false): array
    {
        $text = mb_strtolower(trim($message));
        $pageId = (string) ($page['page_id'] ?? 'unknown');
        $skills = self::ALWAYS;

        if ($this->matches($text, ['compare', ' vs ', 'versus', 'difference', 'cheaper', 'better than'])) {
            $skills[] = 'compare';
        }

        if ($this->matches($text, [
            'recommend', 'what should i', 'which should', 'best for', 'restaurant', 'clinic', 'hotel',
            'what do you suggest', 'what fits',
        ])) {
            $skills[] = 'recommend';
        }

        if ($this->matches($text, [
            'my school', 'my business', 'learning institution', 'i need a website', 'we need a',
            'for my', 'i run a', 'i own a',
        ]) && !$this->matches($text, ['recommend', 'what should i', 'order', 'buy'])) {
            $skills[] = 'qualify';
            $skills[] = 'decision_ui';
        }

        if ($this->matches($text, ['which do you', 'public site', 'or logins', 'pick one', 'a or b'])) {
            $skills[] = 'decision_ui';
        }

        if ($this->matches($text, [
            'too expensive', 'cheaper', 'ai is', 'diy', 'why not just', 'chatgpt', 'budget',
            'how long does', 'takes too long', 'competitor',
        ])) {
            $skills[] = 'handle_objection';
        }

        if ($this->matches($text, [
            'refund', 'privacy', 'terms', 'payment policy', 'cancellation', 'delivery policy',
            'revision', 'hosting policy', 'intellectual property', 'gdpr',
        ]) || $pageId === 'policies') {
            $skills[] = 'explain_policy';
        }

        if ($this->matches($text, ['show me', 'take me', 'where is', 'go to', 'navigate', 'scroll to', 'section'])) {
            $skills[] = 'navigate_site';
            $skills[] = 'show_section';
        }

        if ($this->matches($text, ['contact', 'leave my', 'email me', 'get in touch', 'send details', 'message you'])) {
            $skills[] = 'capture_lead';
        }

        if ($this->matches($text, [
            'order', 'buy', 'quote', 'purchase', 'checkout', 'get started', 'hire',
            'let\'s do', 'lets do', 'i\'ll take', 'ill take', 'go ahead', 'proceed',
        ])) {
            $skills[] = 'configure_service';
            $skills[] = 'start_order';
            $skills[] = 'close';
        }

        if ($this->matches($text, ['track', 'my order', 'tx_ref', 'order status', 'payment status'])) {
            $skills[] = 'check_order';
        }

        if (EscalationPolicy::messageSuggestsHandoff($message)
            || $this->matches($text, ['human', 'whatsapp', 'call me', 'manager', 'person', 'agent', 'talk to'])) {
            $skills[] = 'handoff';
        }

        $servicePages = ['sleek-pages', 'websites', 'mobile-apps', 'business-systems'];
        if (in_array($pageId, $servicePages, true)
            || $this->matches($text, ['website', 'sleek page', 'mobile app', 'business system', 'service'])) {
            $skills[] = 'explain_service';
        }

        if ($pageId === 'products' || $pageId === 'prices'
            || $this->matches($text, ['package', 'product', 'pricing', 'price', 'basic', 'smart', 'premium', 'layout'])) {
            $skills[] = 'explain_product';
        }

        if ($hasPendingConfirmation) {
            if (!in_array('capture_lead', $skills, true) && !in_array('start_order', $skills, true)) {
                $skills[] = 'recover_conversation';
            }
        }

        $unique = [];
        foreach ($skills as $id) {
            if (!in_array($id, $unique, true)) {
                $unique[] = $id;
            }
        }

        if (count($unique) > self::MAX_SKILLS) {
            $core = self::ALWAYS;
            $priority = [
                'handoff', 'close', 'decision_ui', 'recommend', 'qualify', 'handle_objection', 'explain_policy',
                'start_order', 'capture_lead', 'navigate_site', 'show_section', 'explain_product',
                'explain_service', 'compare', 'configure_service', 'check_order',
            ];
            $rest = [];
            foreach ($priority as $id) {
                if (in_array($id, $unique, true) && !in_array($id, $core, true)) {
                    $rest[] = $id;
                }
            }
            foreach ($unique as $id) {
                if (!in_array($id, $core, true) && !in_array($id, $rest, true)) {
                    $rest[] = $id;
                }
            }
            $unique = array_merge($core, array_slice($rest, 0, self::MAX_SKILLS - count($core)));
        }

        return $unique;
    }

    /**
     * @param list<string> $skills
     * @return list<string>
     */
    public function allowedTools(array $skills): array
    {
        $map = [
            'answer_question' => ['get_current_page', 'search_knowledge', 'get_company_document', 'get_product', 'get_service', 'update_customer_model'],
            'explain_product' => ['get_product', 'search_knowledge', 'update_customer_model'],
            'explain_service' => ['get_service', 'search_knowledge', 'update_customer_model'],
            'compare' => ['compare_products'],
            'recommend' => [
                'get_product', 'get_service', 'search_knowledge', 'get_company_document',
                'update_customer_model', 'navigate_to', 'compare_products', 'present_choices',
            ],
            'qualify' => ['update_customer_model', 'get_current_page', 'get_service', 'present_choices'],
            'close' => ['get_product', 'start_order', 'capture_lead', 'update_customer_model', 'navigate_to'],
            'handle_objection' => ['search_knowledge', 'get_company_document', 'get_product', 'update_customer_model'],
            'explain_policy' => ['search_knowledge', 'get_company_document', 'navigate_to', 'show_section'],
            'decision_ui' => ['present_choices', 'update_customer_model', 'get_current_page'],
            'navigate_site' => ['navigate_to'],
            'show_section' => ['show_section'],
            'capture_lead' => ['capture_lead'],
            'configure_service' => ['get_product', 'get_service', 'update_customer_model'],
            'start_order' => ['start_order'],
            'check_order' => ['get_order_status'],
            'handoff' => ['handoff', 'capture_lead', 'update_customer_model'],
            'recover_conversation' => ['get_current_page', 'handoff'],
            'understand_intent' => ['get_current_page', 'update_customer_model'],
        ];

        $tools = [];
        foreach ($skills as $skill) {
            foreach ($map[$skill] ?? [] as $tool) {
                if (!in_array($tool, $tools, true)) {
                    $tools[] = $tool;
                }
            }
        }
        return $tools;
    }

    /**
     * @param list<string> $needles
     */
    private function matches(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if ($needle !== '' && str_contains($haystack, $needle)) {
                return true;
            }
        }
        return false;
    }
}
