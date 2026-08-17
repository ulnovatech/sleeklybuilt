<?php

declare(strict_types=1);

namespace Attendant;

final class ToolContext
{
    /**
     * @param array<string,mixed> $page
     */
    public function __construct(
        public readonly string $conversationId,
        public readonly array $page,
        public readonly bool $confirmed = false,
        public readonly ?ConfirmationGate $gate = null,
        public readonly ?\PDO $pdo = null,
        public readonly ?Telemetry $telemetry = null,
        public readonly ?int $sessionId = null,
    ) {
    }
}
