<?php

declare(strict_types=1);

namespace Attendant;

interface AttendantTool
{
    public function name(): string;

    /**
     * Gemini functionDeclaration schema (parameters object).
     *
     * @return array<string,mixed>
     */
    public function declaration(): array;

    /**
     * @param array<string,mixed> $args
     * @return array<string,mixed> tool-result shape
     */
    public function execute(array $args, ToolContext $ctx): array;
}
