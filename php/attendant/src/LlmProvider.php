<?php

declare(strict_types=1);

namespace Attendant;

interface LlmProvider
{
    /**
     * Stream model text. Invokes $onDelta for each text chunk.
     * Must not invent replies when the API key is missing — throw instead.
     *
     * @param list<array{role:string,text:string}> $history
     * @param callable(string):void $onDelta
     * @return array{text:string,prompt_tokens:?int,completion_tokens:?int}
     */
    public function streamChat(string $systemInstruction, array $history, string $userMessage, callable $onDelta): array;

    /**
     * Non-streaming turn that may return function calls.
     *
     * @param list<array<string,mixed>> $contents Gemini contents
     * @param list<array<string,mixed>> $functionDeclarations
     * @return array{
     *   text:string,
     *   function_calls:list<array{name:string,args:array,id:?string}>,
     *   model_parts:list<array<string,mixed>>,
     *   prompt_tokens:?int,
     *   completion_tokens:?int
     * }
     */
    public function generateWithTools(string $systemInstruction, array $contents, array $functionDeclarations): array;
}
