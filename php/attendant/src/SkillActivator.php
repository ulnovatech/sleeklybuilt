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

        if ($this->matches($text, ['recommend', 'what should i', 'which should', 'best for', 'restaurant', 'clinic', 'hotel'])) {
            $skills[] = 'recommend';
        }

        if ($this->matches($text, ['show me', 'take me', 'where is', 'go to', 'navigate', 'scroll to', 'section'])) {
            $skills[] = 'navigate_site';
            $skills[] = 'show_section';
        }

        if ($this->matches($text, ['contact', 'leave my', 'email me', 'call me', 'get in touch', 'send details', 'message you'])) {
            $skills[] = 'capture_lead';
        }

        if ($this->matches($text, ['order', 'buy', 'quote', 'i want', 'purchase', 'checkout', 'get started', 'hire'])) {
            $skills[] = 'configure_service';
            $skills[] = 'start_order';
        }

        if ($this->matches($text, ['track', 'my order', 'tx_ref', 'order status', 'payment status'])) {
            $skills[] = 'check_order';
        }

        if ($this->matches($text, ['human', 'whatsapp', 'call', 'manager', 'person', 'agent', 'talk to'])) {
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
            // Keep confirmation-adjacent skills; do not add new write skills aggressively
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
            // Always keep core three; fill with the rest until cap
            $core = self::ALWAYS;
            $rest = array_values(array_filter($unique, static fn (string $s): bool => !in_array($s, $core, true)));
            $unique = array_merge($core, array_slice($rest, 0, self::MAX_SKILLS - count($core)));
        }

        return $unique;
    }

    /**
     * Tools the model may request this turn based on active skills.
     * Empty until ToolRouter registers real tools (1C); names still listed for honesty.
     *
     * @param list<string> $skills
     * @return list<string>
     */
    public function allowedTools(array $skills): array
    {
        $map = [
            'answer_question' => ['get_current_page', 'search_knowledge'],
            'explain_product' => ['get_product', 'search_knowledge'],
            'explain_service' => ['get_service', 'search_knowledge'],
            'compare' => ['compare_products'],
            'recommend' => ['get_product', 'get_service', 'search_knowledge'],
            'navigate_site' => ['navigate_to'],
            'show_section' => ['show_section'],
            'capture_lead' => ['capture_lead'],
            'configure_service' => ['get_product', 'get_service'],
            'start_order' => ['start_order'],
            'check_order' => ['get_order_status'],
            'handoff' => ['handoff'],
            'recover_conversation' => ['get_current_page', 'handoff'],
            'understand_intent' => ['get_current_page'],
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
