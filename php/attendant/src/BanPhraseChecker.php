<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Eval-time ban-phrase checker. Guidance for Layer B / fixtures — not a production reply filter.
 */
final class BanPhraseChecker
{
    /** @var list<string> */
    public const PHRASES = [
        'certainly!',
        'absolutely!',
        'of course!',
        'great question',
        'that\'s a fantastic',
        'thats a fantastic',
        'i completely understand',
        'as an ai',
        'as an artificial',
        'cutting-edge',
        'world-class',
        'seamless experience',
        'only today',
        'limited time',
        'would you like me to',
        'shall i go ahead and',
    ];

    /**
     * @return list<string> matched phrases (lowercase)
     */
    public static function find(string $text): array
    {
        $hay = mb_strtolower($text);
        $hits = [];
        foreach (self::PHRASES as $phrase) {
            if (str_contains($hay, $phrase)) {
                $hits[] = $phrase;
            }
        }
        return $hits;
    }

    public static function isClean(string $text): bool
    {
        return self::find($text) === [];
    }
}
