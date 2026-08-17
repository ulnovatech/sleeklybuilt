<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Commercial funnel states for attendant conversations.
 */
final class CommercialStateMachine
{
    public const DISCOVERY = 'discovery';
    public const QUALIFICATION = 'qualification';
    public const RECOMMENDATION = 'recommendation';
    public const AGREEMENT = 'agreement';
    public const ORDER = 'order';
    public const PAYMENT = 'payment';
    public const COMPLETE = 'complete';
    public const ESCALATED = 'escalated';

    /** @var list<string> */
    public const ALL = [
        self::DISCOVERY,
        self::QUALIFICATION,
        self::RECOMMENDATION,
        self::AGREEMENT,
        self::ORDER,
        self::PAYMENT,
        self::COMPLETE,
        self::ESCALATED,
    ];

    /** @var array<string,list<string>> */
    private const ALLOWED = [
        self::DISCOVERY => [self::QUALIFICATION, self::RECOMMENDATION, self::ORDER, self::ESCALATED],
        self::QUALIFICATION => [self::RECOMMENDATION, self::AGREEMENT, self::ORDER, self::ESCALATED],
        self::RECOMMENDATION => [self::AGREEMENT, self::QUALIFICATION, self::ORDER, self::ESCALATED],
        self::AGREEMENT => [self::ORDER, self::RECOMMENDATION, self::ESCALATED],
        self::ORDER => [self::PAYMENT, self::COMPLETE, self::ESCALATED],
        self::PAYMENT => [self::COMPLETE, self::ORDER, self::ESCALATED],
        self::COMPLETE => [self::ESCALATED],
        self::ESCALATED => [self::DISCOVERY, self::QUALIFICATION, self::RECOMMENDATION],
    ];

    public static function normalize(?string $state): string
    {
        $s = strtolower(trim((string) $state));
        return in_array($s, self::ALL, true) ? $s : self::DISCOVERY;
    }

    public static function canTransition(string $from, string $to): bool
    {
        $from = self::normalize($from);
        $to = self::normalize($to);
        if ($from === $to) {
            return true;
        }
        return in_array($to, self::ALLOWED[$from] ?? [], true);
    }

    /**
     * Advance only along allowed edges; otherwise keep current.
     */
    public static function transition(string $from, string $to): string
    {
        $from = self::normalize($from);
        $to = self::normalize($to);
        return self::canTransition($from, $to) ? $to : $from;
    }

    /**
     * Suggest a forward state from model fullness (deterministic, never jumps past recommendation without evidence).
     *
     * @param array<string,mixed> $draft
     */
    public static function inferFromDraft(array $draft): string
    {
        $current = self::normalize(isset($draft['commercial_state']) ? (string) $draft['commercial_state'] : null);
        if (in_array($current, [self::ORDER, self::PAYMENT, self::COMPLETE, self::ESCALATED], true)) {
            return $current;
        }

        $rec = is_array($draft['recommendation'] ?? null) ? $draft['recommendation'] : [];
        $hasRec = trim((string) ($rec['package'] ?? $rec['service_id'] ?? $rec['label'] ?? '')) !== '';
        if ($hasRec) {
            return self::transition($current, self::RECOMMENDATION);
        }

        $cm = is_array($draft['customer_model'] ?? null) ? $draft['customer_model'] : [];
        $hasWho = trim((string) ($cm['org_type'] ?? $cm['who'] ?? $draft['business_name'] ?? '')) !== '';
        $hasObjective = trim((string) ($cm['objective'] ?? '')) !== '';
        if ($hasWho && $hasObjective) {
            return self::transition($current, self::QUALIFICATION);
        }
        if ($hasWho || $hasObjective) {
            return self::transition($current, self::QUALIFICATION);
        }

        return $current === self::DISCOVERY ? self::DISCOVERY : $current;
    }
}
