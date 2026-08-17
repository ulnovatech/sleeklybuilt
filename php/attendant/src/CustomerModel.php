<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Typed draft payload: focus fields + customer_model + commercial_state.
 */
final class CustomerModel
{
    /**
     * @return array<string,mixed>
     */
    public static function empty(): array
    {
        return [
            'service_id' => null,
            'product_id' => null,
            'product_kind' => null,
            'package' => null,
            'template' => null,
            'business_name' => null,
            'notes' => null,
            'commercial_state' => CommercialStateMachine::DISCOVERY,
            'customer_model' => [
                'who' => null,
                'org_type' => null,
                'org_name' => null,
                'objective' => null,
                'why' => null,
                'matters' => [],
                'worries' => [],
                'unknowns' => [],
                'constraints' => [],
            ],
            'recommendation' => [
                'service_id' => null,
                'package' => null,
                'label' => null,
                'rationale' => null,
                'next_step' => null,
            ],
            'open_questions' => [],
            'known_facts' => [],
        ];
    }

    /**
     * @param array<string,mixed>|null $raw
     * @return array<string,mixed>
     */
    public static function normalize(?array $raw): array
    {
        $base = self::empty();
        if ($raw === null || $raw === []) {
            return $base;
        }

        foreach (['service_id', 'product_id', 'product_kind', 'package', 'template', 'business_name', 'notes'] as $key) {
            if (array_key_exists($key, $raw)) {
                $base[$key] = self::nullableString($raw[$key], 200);
            }
        }
        if (isset($raw['package'])) {
            $pkg = self::nullableString($raw['package'], 32);
            $base['package'] = in_array($pkg, ['basic', 'smart', 'premium', null], true) ? $pkg : null;
        }
        if (isset($raw['product_kind'])) {
            $kind = self::nullableString($raw['product_kind'], 40);
            $base['product_kind'] = in_array($kind, ['orderable_package', 'display_package', 'layout', null], true)
                ? $kind
                : null;
        }

        $base['commercial_state'] = CommercialStateMachine::normalize(
            isset($raw['commercial_state']) ? (string) $raw['commercial_state'] : null
        );

        $cmIn = is_array($raw['customer_model'] ?? null) ? $raw['customer_model'] : [];
        $cm = $base['customer_model'];
        foreach (['who', 'org_type', 'org_name', 'objective', 'why'] as $key) {
            if (array_key_exists($key, $cmIn)) {
                $cm[$key] = self::nullableString($cmIn[$key], $key === 'objective' || $key === 'why' ? 300 : 200);
            }
        }
        foreach (['matters', 'worries', 'unknowns', 'constraints'] as $listKey) {
            if (isset($cmIn[$listKey]) && is_array($cmIn[$listKey])) {
                $cm[$listKey] = self::stringList($cmIn[$listKey], 8, 120);
            }
        }
        $base['customer_model'] = $cm;

        $recIn = is_array($raw['recommendation'] ?? null) ? $raw['recommendation'] : [];
        $rec = $base['recommendation'];
        foreach (['service_id', 'label', 'rationale', 'next_step'] as $key) {
            if (array_key_exists($key, $recIn)) {
                $max = $key === 'rationale' ? 400 : 200;
                $rec[$key] = self::nullableString($recIn[$key], $max);
            }
        }
        if (array_key_exists('package', $recIn)) {
            $pkg = self::nullableString($recIn['package'], 32);
            $rec['package'] = in_array($pkg, ['basic', 'smart', 'premium', null], true) ? $pkg : null;
        }
        $base['recommendation'] = $rec;

        if (isset($raw['open_questions']) && is_array($raw['open_questions'])) {
            $base['open_questions'] = self::stringList($raw['open_questions'], 6, 160);
        }
        if (isset($raw['known_facts']) && is_array($raw['known_facts'])) {
            $base['known_facts'] = self::stringList($raw['known_facts'], 24, 80);
        }

        // Mirror business_name ↔ org_name when one side is empty
        if (($base['business_name'] === null || $base['business_name'] === '')
            && !empty($cm['org_name'])) {
            $base['business_name'] = $cm['org_name'];
        }
        if (empty($base['customer_model']['org_name']) && !empty($base['business_name'])) {
            $base['customer_model']['org_name'] = $base['business_name'];
        }

        $base['commercial_state'] = CommercialStateMachine::inferFromDraft($base);
        return $base;
    }

    /**
     * Merge patch into existing draft. Lists append unique; scalars overwrite when non-null.
     *
     * @param array<string,mixed>|null $existing
     * @param array<string,mixed> $patch
     * @return array<string,mixed>
     */
    public static function merge(?array $existing, array $patch): array
    {
        $current = self::normalize($existing);
        $incoming = self::normalize(array_merge(self::empty(), $patch));

        foreach (['service_id', 'product_id', 'product_kind', 'package', 'template', 'business_name', 'notes'] as $key) {
            if (array_key_exists($key, $patch) && $patch[$key] !== null && $patch[$key] !== '') {
                $current[$key] = $incoming[$key];
            }
        }

        if (isset($patch['commercial_state'])) {
            $current['commercial_state'] = CommercialStateMachine::transition(
                (string) $current['commercial_state'],
                (string) $incoming['commercial_state']
            );
        }

        if (isset($patch['customer_model']) && is_array($patch['customer_model'])) {
            $cm = $current['customer_model'];
            $p = $patch['customer_model'];
            foreach (['who', 'org_type', 'org_name', 'objective', 'why'] as $key) {
                if (isset($p[$key]) && is_string($p[$key]) && trim($p[$key]) !== '') {
                    $cm[$key] = self::nullableString($p[$key], $key === 'objective' || $key === 'why' ? 300 : 200);
                }
            }
            foreach (['matters', 'worries', 'unknowns', 'constraints'] as $listKey) {
                if (isset($p[$listKey]) && is_array($p[$listKey])) {
                    $cm[$listKey] = self::mergeLists($cm[$listKey] ?? [], self::stringList($p[$listKey], 8, 120), 8);
                }
            }
            $current['customer_model'] = $cm;
        }

        if (isset($patch['recommendation']) && is_array($patch['recommendation'])) {
            $rec = $current['recommendation'];
            $p = $patch['recommendation'];
            foreach (['service_id', 'package', 'label', 'rationale', 'next_step'] as $key) {
                if (isset($p[$key]) && $p[$key] !== null && $p[$key] !== '') {
                    $rec[$key] = $incoming['recommendation'][$key] ?? self::nullableString($p[$key], 400);
                }
            }
            $current['recommendation'] = $rec;
            if ($current['commercial_state'] === CommercialStateMachine::DISCOVERY
                || $current['commercial_state'] === CommercialStateMachine::QUALIFICATION) {
                $current['commercial_state'] = CommercialStateMachine::transition(
                    (string) $current['commercial_state'],
                    CommercialStateMachine::RECOMMENDATION
                );
            }
        }

        if (isset($patch['open_questions']) && is_array($patch['open_questions'])) {
            $current['open_questions'] = self::stringList($patch['open_questions'], 6, 160);
        }
        if (isset($patch['known_facts']) && is_array($patch['known_facts'])) {
            $current['known_facts'] = self::mergeLists(
                $current['known_facts'],
                self::stringList($patch['known_facts'], 24, 80),
                24
            );
        }

        if (!empty($current['business_name']) && empty($current['customer_model']['org_name'])) {
            $current['customer_model']['org_name'] = $current['business_name'];
        }

        $current['commercial_state'] = CommercialStateMachine::inferFromDraft($current);
        return self::normalize($current);
    }

    /**
     * Compact view for prompt injection (omit empty noise).
     *
     * @param array<string,mixed> $draft
     * @return array<string,mixed>
     */
    public static function forPrompt(array $draft): array
    {
        $d = self::normalize($draft);
        $cm = $d['customer_model'];
        $rec = $d['recommendation'];

        $out = [
            'commercial_state' => $d['commercial_state'],
            'do_not_reask' => self::knownSummary($d),
            'focus' => array_filter([
                'service_id' => $d['service_id'],
                'product_id' => $d['product_id'],
                'product_kind' => $d['product_kind'],
                'package' => $d['package'],
                'template' => $d['template'],
                'business_name' => $d['business_name'],
            ], static fn ($v) => $v !== null && $v !== ''),
            'customer_model' => array_filter([
                'who' => $cm['who'],
                'org_type' => $cm['org_type'],
                'org_name' => $cm['org_name'],
                'objective' => $cm['objective'],
                'why' => $cm['why'],
                'matters' => $cm['matters'] !== [] ? $cm['matters'] : null,
                'worries' => $cm['worries'] !== [] ? $cm['worries'] : null,
                'unknowns' => $cm['unknowns'] !== [] ? $cm['unknowns'] : null,
                'constraints' => $cm['constraints'] !== [] ? $cm['constraints'] : null,
            ], static fn ($v) => $v !== null && $v !== [] && $v !== ''),
            'recommendation' => array_filter([
                'service_id' => $rec['service_id'],
                'package' => $rec['package'],
                'label' => $rec['label'],
                'rationale' => $rec['rationale'],
                'next_step' => $rec['next_step'],
            ], static fn ($v) => $v !== null && $v !== ''),
            'open_questions' => $d['open_questions'],
            'known_facts' => $d['known_facts'],
        ];

        if ($out['focus'] === []) {
            unset($out['focus']);
        }
        if ($out['customer_model'] === []) {
            unset($out['customer_model']);
        }
        if ($out['recommendation'] === []) {
            unset($out['recommendation']);
        }
        if ($out['open_questions'] === []) {
            unset($out['open_questions']);
        }
        if ($out['known_facts'] === []) {
            unset($out['known_facts']);
        }
        if ($out['do_not_reask'] === []) {
            unset($out['do_not_reask']);
        }

        return $out;
    }

    /**
     * @param array<string,mixed> $draft
     * @return list<string>
     */
    public static function knownSummary(array $draft): array
    {
        $d = self::normalize($draft);
        $out = [];
        $cm = $d['customer_model'];
        if (!empty($cm['org_type'])) {
            $out[] = 'org_type=' . $cm['org_type'];
        }
        if (!empty($cm['org_name']) || !empty($d['business_name'])) {
            $out[] = 'org_name=' . ($cm['org_name'] ?: $d['business_name']);
        }
        if (!empty($cm['objective'])) {
            $out[] = 'objective_known';
        }
        if (!empty($d['package']) || !empty($d['recommendation']['package'])) {
            $out[] = 'package=' . ($d['package'] ?: $d['recommendation']['package']);
        }
        if (!empty($d['service_id']) || !empty($d['recommendation']['service_id'])) {
            $out[] = 'service=' . ($d['service_id'] ?: $d['recommendation']['service_id']);
        }
        foreach ($d['known_facts'] as $fact) {
            if (!in_array($fact, $out, true)) {
                $out[] = $fact;
            }
        }
        return array_slice($out, 0, 16);
    }

    private static function nullableString(mixed $value, int $max): ?string
    {
        if ($value === null) {
            return null;
        }
        $s = trim((string) $value);
        if ($s === '') {
            return null;
        }
        return mb_substr($s, 0, $max);
    }

    /**
     * @param list<mixed> $items
     * @return list<string>
     */
    private static function stringList(array $items, int $maxItems, int $maxLen): array
    {
        $out = [];
        foreach ($items as $item) {
            if (!is_string($item) && !is_numeric($item)) {
                continue;
            }
            $s = trim((string) $item);
            if ($s === '') {
                continue;
            }
            $s = mb_substr($s, 0, $maxLen);
            if (!in_array($s, $out, true)) {
                $out[] = $s;
            }
            if (count($out) >= $maxItems) {
                break;
            }
        }
        return $out;
    }

    /**
     * @param list<string> $a
     * @param list<string> $b
     * @return list<string>
     */
    private static function mergeLists(array $a, array $b, int $max): array
    {
        $out = $a;
        foreach ($b as $item) {
            if (!in_array($item, $out, true)) {
                $out[] = $item;
            }
            if (count($out) >= $max) {
                break;
            }
        }
        return array_slice($out, 0, $max);
    }
}
