<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Hard-gated escalation reasons for handoff. Soft "offer WhatsApp always" is forbidden.
 */
final class EscalationPolicy
{
    public const EXPLICIT_HUMAN = 'explicit_human';
    public const KNOWLEDGE_FAILURE = 'knowledge_failure';
    public const AUTHORITY_BREACH = 'authority_breach';
    public const LEGAL_DISPUTE = 'legal_dispute';
    public const HIGH_CONSEQUENCE = 'high_consequence';
    public const REPEATED_FAILURE = 'repeated_failure';
    public const SAFETY = 'safety';

    /** @var list<string> */
    public const ALLOWED_CODES = [
        self::EXPLICIT_HUMAN,
        self::KNOWLEDGE_FAILURE,
        self::AUTHORITY_BREACH,
        self::LEGAL_DISPUTE,
        self::HIGH_CONSEQUENCE,
        self::REPEATED_FAILURE,
        self::SAFETY,
    ];

    public static function normalizeCode(?string $code): ?string
    {
        $c = strtolower(trim((string) $code));
        return in_array($c, self::ALLOWED_CODES, true) ? $c : null;
    }

    /**
     * Infer a code from visitor text when the model omits reason_code but intent is clear.
     */
    public static function inferFromMessage(string $message): ?string
    {
        $t = mb_strtolower($message);
        if (self::matches($t, [
            'talk to someone', 'talk to a person', 'real person', 'human', 'manager',
            'whatsapp', 'call me', 'phone me', 'speak to', 'agent please', 'customer service',
        ])) {
            return self::EXPLICIT_HUMAN;
        }
        if (self::matches($t, ['lawyer', 'sue', 'legal action', 'court', 'dispute the contract'])) {
            return self::LEGAL_DISPUTE;
        }
        if (self::matches($t, ['kill myself', 'suicide', 'self-harm', 'bomb', 'attack'])) {
            return self::SAFETY;
        }
        return null;
    }

    /**
     * @param array<string,mixed> $args
     * @param array<string,mixed> $page
     * @return array{ok:bool,code:?string,error?:string}
     */
    public static function validateHandoffArgs(array $args, string $visitorHint = ''): array
    {
        $code = self::normalizeCode(isset($args['reason_code']) ? (string) $args['reason_code'] : null);
        if ($code === null) {
            $code = self::inferFromMessage($visitorHint);
        }
        if ($code === null && isset($args['reason']) && is_string($args['reason'])) {
            $code = self::inferFromMessage($args['reason']);
        }
        if ($code === null) {
            return [
                'ok' => false,
                'code' => null,
                'error' => 'Escalation needs an allowed reason. Continue in chat or ask if they want WhatsApp.',
            ];
        }
        return ['ok' => true, 'code' => $code];
    }

    /**
     * Soft check: should SkillActivator load handoff this turn?
     */
    public static function messageSuggestsHandoff(string $message): bool
    {
        return self::inferFromMessage($message) !== null
            || self::matches(mb_strtolower($message), [
                'refund fight', 'not what i paid', 'exception to policy', 'override the policy',
                'something is broken', 'angry', 'complaint', 'failed twice',
            ]);
    }

    /**
     * @param list<string> $needles
     */
    private static function matches(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if ($needle !== '' && str_contains($haystack, $needle)) {
                return true;
            }
        }
        return false;
    }
}
