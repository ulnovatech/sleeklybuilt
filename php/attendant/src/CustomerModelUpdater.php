<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Deterministic customer-model updates from visitor text and tool results.
 */
final class CustomerModelUpdater
{
    /**
     * @param array<string,mixed>|null $draft
     * @param array<string,mixed> $page
     * @return array<string,mixed>
     */
    public function fromMessage(?array $draft, string $message, array $page = []): array
    {
        $patch = ['known_facts' => []];
        $lower = mb_strtolower($message);

        $orgType = $this->detectOrgType($lower);
        if ($orgType !== null) {
            $patch['customer_model']['org_type'] = $orgType;
            $patch['customer_model']['who'] = $patch['customer_model']['who'] ?? $orgType . ' representative';
            $patch['known_facts'][] = 'org_type=' . $orgType;
        }

        if (preg_match('/\b(website|web site|site)\b/u', $lower)) {
            $patch['service_id'] = $patch['service_id'] ?? 'websites';
            $patch['customer_model']['objective'] = $patch['customer_model']['objective']
                ?? 'public website';
            $patch['known_facts'][] = 'wants_website';
        }
        if (preg_match('/\b(sleek\s*pages?|landing\s*page)\b/u', $lower)) {
            $patch['service_id'] = 'sleek-pages';
            $patch['known_facts'][] = 'wants_sleek_pages';
        }
        if (preg_match('/\b(mobile\s*app|android|ios)\b/u', $lower)) {
            $patch['service_id'] = 'mobile-apps';
            $patch['known_facts'][] = 'wants_app';
        }
        if (preg_match('/\b(portal|lms|student\s*login|staff\s*login|workflow|business\s*system)\b/u', $lower)) {
            $patch['service_id'] = 'business-systems';
            $patch['customer_model']['objective'] = 'operational system';
            $patch['customer_model']['worries'] = ['needs_more_than_brochure_site'];
            $patch['known_facts'][] = 'needs_system';
        }

        $package = $this->detectPackage($lower);
        if ($package !== null) {
            $patch['package'] = $package;
            $patch['product_kind'] = 'orderable_package';
            $patch['recommendation']['package'] = $package;
            $patch['recommendation']['service_id'] = $patch['service_id'] ?? 'websites';
            $patch['recommendation']['label'] = 'Business ' . ucfirst($package);
            $patch['known_facts'][] = 'package=' . $package;
            $patch['commercial_state'] = CommercialStateMachine::RECOMMENDATION;
        }

        if (preg_match('/\b(budget|cheap|cheaper|cost|afford)\b/u', $lower)) {
            $patch['customer_model']['constraints'] = ['cost_sensitive'];
            $patch['customer_model']['worries'] = ['cost'];
            $patch['known_facts'][] = 'cost_sensitive';
        }
        if (preg_match('/\b(ai\s*website|chatgpt|diy)\b/u', $lower)) {
            $patch['customer_model']['worries'] = ['considering_diy_or_ai'];
            $patch['known_facts'][] = 'diy_or_ai_comparison';
        }

        $orgName = $this->detectOrgName($message);
        if ($orgName !== null) {
            $patch['business_name'] = $orgName;
            $patch['customer_model']['org_name'] = $orgName;
            $patch['known_facts'][] = 'org_name=' . $orgName;
        }

        $pageService = $page['visible_service_id'] ?? null;
        if (is_string($pageService) && $pageService !== '' && empty($patch['service_id'])) {
            $patch['service_id'] = $pageService;
        }

        if ($orgType !== null || isset($patch['customer_model']['objective'])) {
            $patch['commercial_state'] = $patch['commercial_state']
                ?? CommercialStateMachine::QUALIFICATION;
        }

        if ($patch === ['known_facts' => []]) {
            return CustomerModel::normalize($draft);
        }
        if ($patch['known_facts'] === []) {
            unset($patch['known_facts']);
        }

        return CustomerModel::merge($draft, $patch);
    }

    /**
     * @param array<string,mixed>|null $draft
     * @param array<string,mixed> $toolResult
     * @return array<string,mixed>
     */
    public function fromToolResult(?array $draft, string $toolName, array $toolResult): array
    {
        if (!($toolResult['ok'] ?? false)) {
            if ($toolName === 'get_order_status') {
                return CustomerModel::merge($draft, [
                    'known_facts' => ['status_lookup_failed'],
                ]);
            }
            if ($toolName === 'start_order') {
                return CustomerModel::merge($draft, [
                    'known_facts' => ['order_failed'],
                ]);
            }
            return CustomerModel::normalize($draft);
        }
        $data = is_array($toolResult['data'] ?? null) ? $toolResult['data'] : [];
        $patch = [];

        if ($toolName === 'get_product' && isset($data['product']) && is_array($data['product'])) {
            $product = $data['product'];
            $id = (string) ($product['id'] ?? '');
            if (in_array($id, ['basic', 'smart', 'premium'], true)) {
                $patch['package'] = $id;
                $patch['product_id'] = $id;
                $patch['product_kind'] = 'orderable_package';
                $patch['recommendation']['package'] = $id;
                $patch['recommendation']['label'] = (string) ($product['label'] ?? ('Business ' . ucfirst($id)));
                $patch['commercial_state'] = CommercialStateMachine::RECOMMENDATION;
                $patch['known_facts'] = ['package=' . $id];
            }
        }

        if ($toolName === 'get_service' && isset($data['service']) && is_array($data['service'])) {
            $sid = (string) ($data['service']['canonical_id'] ?? $data['service']['id'] ?? '');
            if ($sid !== '') {
                $patch['service_id'] = $sid;
                $patch['known_facts'] = ['service=' . $sid];
            }
        }

        if ($toolName === 'start_order') {
            $orderPatch = [
                'commercial_state' => CommercialStateMachine::ORDER,
                'product_kind' => 'orderable_package',
                'known_facts' => ['order_started'],
            ];
            if (!empty($data['package'])) {
                $orderPatch['package'] = (string) $data['package'];
            }
            $merged = CustomerModel::merge($draft, $orderPatch);
            // Handoff to portfolio checkout advances ORDER → PAYMENT (never COMPLETE / paid).
            if (!empty($data['payment_handoff']) && is_array($data['payment_handoff'])) {
                $merged = CustomerModel::merge($merged, [
                    'commercial_state' => CommercialStateMachine::PAYMENT,
                    'known_facts' => ['payment_handoff'],
                ]);
            }
            return $merged;
        }

        if ($toolName === 'capture_lead') {
            $patch['commercial_state'] = CommercialStateMachine::AGREEMENT;
            $patch['known_facts'] = ['lead_captured'];
        }

        if ($toolName === 'handoff') {
            $patch['commercial_state'] = CommercialStateMachine::ESCALATED;
            $patch['known_facts'] = ['escalated'];
        }

        if ($toolName === 'get_order_status') {
            return $this->fromOrderStatus($draft, $data);
        }

        if ($toolName === 'update_customer_model' && isset($data['draft']) && is_array($data['draft'])) {
            return CustomerModel::normalize($data['draft']);
        }

        if ($toolName === 'present_choices' && ($toolResult['ok'] ?? false)) {
            $patch = [
                'known_facts' => ['awaiting_choice'],
                'commercial_state' => CommercialStateMachine::QUALIFICATION,
            ];
            return CustomerModel::merge($draft, $patch);
        }

        if ($patch === []) {
            return CustomerModel::normalize($draft);
        }
        return CustomerModel::merge($draft, $patch);
    }

    /**
     * Payment language must follow backend status only — never invent success.
     *
     * @param array<string,mixed>|null $draft
     * @param array<string,mixed> $data
     * @return array<string,mixed>
     */
    private function fromOrderStatus(?array $draft, array $data): array
    {
        $status = strtolower(trim((string) ($data['status'] ?? '')));
        $facts = $status !== '' ? ['order_status=' . $status] : ['order_status_unknown'];
        $patch = ['known_facts' => $facts];

        if (!empty($data['package']) && in_array((string) $data['package'], ['basic', 'smart', 'premium'], true)) {
            $patch['package'] = (string) $data['package'];
            $patch['product_kind'] = 'orderable_package';
        }

        if (in_array($status, ['successful', 'success', 'completed', 'paid'], true)) {
            $patch['commercial_state'] = CommercialStateMachine::COMPLETE;
            $facts[] = 'payment_confirmed';
            $patch['known_facts'] = $facts;
        } elseif (in_array($status, ['pending', 'processing', 'initiated', 'new'], true)) {
            $patch['commercial_state'] = CommercialStateMachine::PAYMENT;
        } elseif (in_array($status, ['failed', 'cancelled', 'canceled'], true)) {
            $patch['commercial_state'] = CommercialStateMachine::PAYMENT;
            $facts[] = 'payment_not_complete';
            $patch['known_facts'] = $facts;
        }
        // Unknown statuses: record fact only — do not set COMPLETE.

        return CustomerModel::merge($draft, $patch);
    }

    /**
     * Apply selected Decision UI options (model_patch from each option).
     *
     * @param array<string,mixed>|null $draft
     * @param list<array<string,mixed>> $selectedOptions
     * @return array<string,mixed>
     */
    public function fromChoiceSelection(?array $draft, array $selectedOptions): array
    {
        $merged = CustomerModel::normalize($draft);
        $labels = [];
        foreach ($selectedOptions as $opt) {
            if (!is_array($opt)) {
                continue;
            }
            $label = trim((string) ($opt['label'] ?? $opt['id'] ?? ''));
            if ($label !== '') {
                $labels[] = $label;
            }
            $patch = isset($opt['model_patch']) && is_array($opt['model_patch'])
                ? $opt['model_patch']
                : [];
            if ($patch !== []) {
                $merged = CustomerModel::merge($merged, $patch);
            }
        }
        if ($labels !== []) {
            $merged = CustomerModel::merge($merged, [
                'known_facts' => array_map(static fn (string $l): string => 'chose:' . $l, $labels),
            ]);
            if ($merged['commercial_state'] === CommercialStateMachine::DISCOVERY) {
                $merged = CustomerModel::merge($merged, [
                    'commercial_state' => CommercialStateMachine::QUALIFICATION,
                ]);
            }
        }
        // Clear awaiting flag
        $facts = array_values(array_filter(
            $merged['known_facts'] ?? [],
            static fn ($f): bool => $f !== 'awaiting_choice'
        ));
        $merged['known_facts'] = $facts;
        return CustomerModel::normalize($merged);
    }

    private function detectOrgType(string $lower): ?string
    {
        $map = [
            'school' => ['school', 'learning institution', 'institution', 'college', 'university', 'academy'],
            'church' => ['church', 'ministry', 'congregation'],
            'clinic' => ['clinic', 'hospital', 'medical', 'doctor'],
            'restaurant' => ['restaurant', 'cafe', 'hotel'],
            'ngo' => ['ngo', 'nonprofit', 'non-profit', 'charity'],
            'sacco' => ['sacco', 'cooperative', 'co-operative'],
            'business' => ['my business', 'our company', 'small business', 'startup'],
        ];
        foreach ($map as $type => $needles) {
            foreach ($needles as $needle) {
                if (str_contains($lower, $needle)) {
                    return $type;
                }
            }
        }
        return null;
    }

    private function detectPackage(string $lower): ?string
    {
        if (preg_match('/\b(business\s*)?premium\b/u', $lower)) {
            return 'premium';
        }
        if (preg_match('/\b(business\s*)?smart\b/u', $lower)) {
            return 'smart';
        }
        if (preg_match('/\b(business\s*)?basic\b/u', $lower)) {
            return 'basic';
        }
        return null;
    }

    private function detectOrgName(string $message): ?string
    {
        if (preg_match('/\b(?:called|named)\s+["\']?([A-Z][\w\'&\.\-]+(?:\s+[A-Z][\w\'&\.\-]+){0,4})/u', $message, $m)) {
            return mb_substr(trim($m[1]), 0, 120);
        }
        if (preg_match('/\b(?:for|at)\s+([A-Z][\w\'&\.\-]+(?:\s+[A-Z][\w\'&\.\-]+){0,3})\b/u', $message, $m)) {
            $name = trim($m[1]);
            $skip = ['My', 'Our', 'The', 'A', 'An', 'I', 'We', 'This', 'That'];
            if (!in_array($name, $skip, true)) {
                return mb_substr($name, 0, 120);
            }
        }
        return null;
    }
}
