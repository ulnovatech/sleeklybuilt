<?php

declare(strict_types=1);

namespace Attendant;

final class ToolResults
{
    /**
     * @param array<string,mixed>|null $data
     * @return array<string,mixed>
     */
    public static function ok(
        string $tool,
        ?array $data,
        string $sideEffects = 'none',
        ?string $summary = null
    ): array {
        return [
            'ok' => true,
            'tool' => $tool,
            'code' => 'ok',
            'user_safe_error' => null,
            'data' => $data,
            'side_effects' => $sideEffects,
            'confirmation_required' => false,
            'summary' => $summary,
        ];
    }

    /**
     * @param array<string,mixed>|null $data
     * @return array<string,mixed>
     */
    public static function fail(
        string $tool,
        string $code,
        string $userSafeError,
        string $sideEffects = 'none',
        ?array $data = null,
        bool $confirmationRequired = false,
        ?string $summary = null
    ): array {
        return [
            'ok' => false,
            'tool' => $tool,
            'code' => $code,
            'user_safe_error' => $userSafeError,
            'data' => $data,
            'side_effects' => $sideEffects,
            'confirmation_required' => $confirmationRequired,
            'summary' => $summary,
        ];
    }
}
