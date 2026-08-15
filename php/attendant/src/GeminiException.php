<?php

declare(strict_types=1);

namespace Attendant;

final class GeminiException extends \RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        public readonly string $userSafeMessage,
        public readonly int $httpStatus = 502,
        string $internalDetail = ''
    ) {
        parent::__construct($internalDetail !== '' ? $internalDetail : $userSafeMessage);
    }
}
