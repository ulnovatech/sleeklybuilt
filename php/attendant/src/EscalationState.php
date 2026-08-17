<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Escalation lifecycle for attendant conversations.
 * Separate from conversation status (active|expired|cleared).
 */
final class EscalationState
{
    public const AUTONOMOUS = 'autonomous';
    public const ESCALATED = 'escalated';
    public const HUMAN_ACTIVE = 'human_active';
    public const RESUMED = 'resumed';

    /** @var list<string> */
    public const ALL = [
        self::AUTONOMOUS,
        self::ESCALATED,
        self::HUMAN_ACTIVE,
        self::RESUMED,
    ];

    /** @var array<string,list<string>> */
    private const ALLOWED = [
        self::AUTONOMOUS => [self::ESCALATED],
        self::ESCALATED => [self::HUMAN_ACTIVE, self::RESUMED, self::AUTONOMOUS],
        self::HUMAN_ACTIVE => [self::RESUMED, self::AUTONOMOUS],
        self::RESUMED => [self::AUTONOMOUS, self::ESCALATED],
    ];

    public static function normalize(?string $state): string
    {
        $s = strtolower(trim((string) $state));
        return in_array($s, self::ALL, true) ? $s : self::AUTONOMOUS;
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

    public static function transition(string $from, string $to): string
    {
        $from = self::normalize($from);
        $to = self::normalize($to);
        return self::canTransition($from, $to) ? $to : $from;
    }

    /** Visitor chat must not call the LLM while waiting for / talking to a human. */
    public static function isHumanControlled(string $state): bool
    {
        $state = self::normalize($state);
        return $state === self::ESCALATED || $state === self::HUMAN_ACTIVE;
    }
}
