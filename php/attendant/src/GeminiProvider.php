<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Sole production model: Gemini 2.5 Flash Lite.
 *
 * Transport:
 * - Google Generative Language API when GEMINI_API_KEY is a Google key
 * - OpenRouter (OpenAI-compatible) when the key starts with sk-or- (same locked model id)
 */
final class GeminiProvider implements LlmProvider
{
    private string $apiKey;
    private string $model;
    private bool $openRouter;

    public function __construct(?string $apiKey = null, ?string $model = null)
    {
        $key = $apiKey;
        if ($key === null) {
            $gemini = getenv('GEMINI_API_KEY') !== false ? trim((string) getenv('GEMINI_API_KEY')) : '';
            $openrouter = getenv('OPENROUTER_API_KEY') !== false ? trim((string) getenv('OPENROUTER_API_KEY')) : '';
            $key = $gemini !== '' ? $gemini : $openrouter;
        }
        $this->apiKey = trim((string) $key);
        $this->openRouter = str_starts_with($this->apiKey, 'sk-or-');
        $this->model = $model ?? ($this->openRouter
            ? 'google/' . ATTENDANT_MODEL
            : ATTENDANT_MODEL);
    }

    public function isConfigured(): bool
    {
        return $this->apiKey !== '';
    }

    public function usesOpenRouter(): bool
    {
        return $this->openRouter;
    }

    public function streamChat(string $systemInstruction, array $history, string $userMessage, callable $onDelta): array
    {
        if (!$this->isConfigured()) {
            throw new GeminiException('missing_api_key', "I can't reply just now.", 503);
        }

        if ($this->openRouter) {
            return $this->openRouterStream($systemInstruction, $history, $userMessage, $onDelta);
        }

        return $this->googleStream($systemInstruction, $history, $userMessage, $onDelta);
    }

    public function generateWithTools(string $systemInstruction, array $contents, array $functionDeclarations): array
    {
        if (!$this->isConfigured()) {
            throw new GeminiException('missing_api_key', "I can't reply just now.", 503);
        }

        if ($this->openRouter) {
            return $this->openRouterGenerate($systemInstruction, $contents, $functionDeclarations);
        }

        return $this->googleGenerate($systemInstruction, $contents, $functionDeclarations);
    }

    /**
     * @param list<array{role:string,text:string}> $history
     * @param callable(string):void $onDelta
     * @return array{text:string,prompt_tokens:?int,completion_tokens:?int}
     */
    private function googleStream(string $systemInstruction, array $history, string $userMessage, callable $onDelta): array
    {
        $contents = [];
        foreach ($history as $msg) {
            $role = ($msg['role'] ?? '') === 'attendant' ? 'model' : 'user';
            $text = trim((string) ($msg['text'] ?? ''));
            if ($text === '' || ($msg['role'] ?? '') === 'system') {
                continue;
            }
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $text]],
            ];
        }
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]],
        ];

        $payload = [
            'systemInstruction' => ['parts' => [['text' => $systemInstruction]]],
            'contents' => $contents,
            'generationConfig' => ['temperature' => 0.4, 'maxOutputTokens' => 1024],
        ];

        $url = sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:streamGenerateContent?alt=sse&key=%s',
            rawurlencode($this->model),
            rawurlencode($this->apiKey)
        );

        $fullText = '';
        $promptTokens = null;
        $completionTokens = null;
        $buffer = '';
        $rawAccum = '';
        $streamError = null;

        $ch = curl_init($url);
        if ($ch === false) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502);
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT => 90,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_WRITEFUNCTION => function ($ch, string $chunk) use (
                &$buffer,
                &$fullText,
                &$promptTokens,
                &$completionTokens,
                &$rawAccum,
                &$streamError,
                $onDelta
            ): int {
                $rawAccum .= $chunk;
                $buffer .= $chunk;
                while (($pos = strpos($buffer, "\n")) !== false) {
                    $line = substr($buffer, 0, $pos);
                    $buffer = substr($buffer, $pos + 1);
                    $line = rtrim($line, "\r");
                    if ($line === '' || !str_starts_with($line, 'data:')) {
                        continue;
                    }
                    $data = trim(substr($line, 5));
                    if ($data === '' || $data === '[DONE]') {
                        continue;
                    }
                    $json = json_decode($data, true);
                    if (!is_array($json)) {
                        continue;
                    }
                    if (isset($json['error'])) {
                        $streamError = is_array($json['error'])
                            ? (string) ($json['error']['message'] ?? 'Gemini error')
                            : 'Gemini error';
                        continue;
                    }
                    $delta = self::extractGoogleText($json);
                    if ($delta !== '') {
                        $fullText .= $delta;
                        $onDelta($delta);
                    }
                    if (isset($json['usageMetadata']) && is_array($json['usageMetadata'])) {
                        if (isset($json['usageMetadata']['promptTokenCount'])) {
                            $promptTokens = (int) $json['usageMetadata']['promptTokenCount'];
                        }
                        if (isset($json['usageMetadata']['candidatesTokenCount'])) {
                            $completionTokens = (int) $json['usageMetadata']['candidatesTokenCount'];
                        }
                    }
                }
                return strlen($chunk);
            },
        ]);

        $ok = curl_exec($ch);
        $httpStatus = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($ok === false) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502, $curlErr !== '' ? $curlErr : 'curl failed');
        }
        if ($streamError !== null) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502, $streamError);
        }
        if ($httpStatus >= 400) {
            $detail = 'HTTP ' . $httpStatus;
            $asJson = json_decode($rawAccum, true);
            if (is_array($asJson) && isset($asJson['error']['message'])) {
                $detail = (string) $asJson['error']['message'];
            }
            throw new GeminiException('backend_error', "I can't reply just now.", 502, $detail);
        }
        if (trim($fullText) === '') {
            throw new GeminiException('backend_error', "I can't reply just now.", 502, 'empty model response');
        }

        return ['text' => $fullText, 'prompt_tokens' => $promptTokens, 'completion_tokens' => $completionTokens];
    }

    /**
     * @param list<array{role:string,text:string}> $history
     * @param callable(string):void $onDelta
     * @return array{text:string,prompt_tokens:?int,completion_tokens:?int}
     */
    private function openRouterStream(string $systemInstruction, array $history, string $userMessage, callable $onDelta): array
    {
        $messages = [['role' => 'system', 'content' => $systemInstruction]];
        foreach ($history as $msg) {
            $text = trim((string) ($msg['text'] ?? ''));
            if ($text === '') {
                continue;
            }
            $messages[] = [
                'role' => ($msg['role'] ?? '') === 'attendant' ? 'assistant' : 'user',
                'content' => $text,
            ];
        }
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        $payload = [
            'model' => $this->model,
            'messages' => $messages,
            'temperature' => 0.4,
            'max_tokens' => 1024,
            'stream' => true,
        ];

        $fullText = '';
        $promptTokens = null;
        $completionTokens = null;
        $buffer = '';
        $rawAccum = '';
        $streamError = null;

        $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
        if ($ch === false) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502);
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $this->openRouterHeaders(),
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT => 90,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_WRITEFUNCTION => function ($ch, string $chunk) use (
                &$buffer,
                &$fullText,
                &$promptTokens,
                &$completionTokens,
                &$rawAccum,
                &$streamError,
                $onDelta
            ): int {
                $rawAccum .= $chunk;
                $buffer .= $chunk;
                while (($pos = strpos($buffer, "\n")) !== false) {
                    $line = substr($buffer, 0, $pos);
                    $buffer = substr($buffer, $pos + 1);
                    $line = rtrim($line, "\r");
                    if ($line === '' || !str_starts_with($line, 'data:')) {
                        continue;
                    }
                    $data = trim(substr($line, 5));
                    if ($data === '' || $data === '[DONE]') {
                        continue;
                    }
                    $json = json_decode($data, true);
                    if (!is_array($json)) {
                        continue;
                    }
                    if (isset($json['error'])) {
                        $streamError = is_array($json['error'])
                            ? (string) ($json['error']['message'] ?? 'OpenRouter error')
                            : 'OpenRouter error';
                        continue;
                    }
                    $delta = (string) ($json['choices'][0]['delta']['content'] ?? '');
                    if ($delta !== '') {
                        $fullText .= $delta;
                        $onDelta($delta);
                    }
                    if (isset($json['usage']) && is_array($json['usage'])) {
                        $promptTokens = isset($json['usage']['prompt_tokens']) ? (int) $json['usage']['prompt_tokens'] : $promptTokens;
                        $completionTokens = isset($json['usage']['completion_tokens']) ? (int) $json['usage']['completion_tokens'] : $completionTokens;
                    }
                }
                return strlen($chunk);
            },
        ]);

        $ok = curl_exec($ch);
        $httpStatus = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($ok === false) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502, $curlErr !== '' ? $curlErr : 'curl failed');
        }
        if ($streamError !== null) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502, $streamError);
        }
        if ($httpStatus >= 400) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502, 'HTTP ' . $httpStatus . ' ' . substr($rawAccum, 0, 200));
        }
        if (trim($fullText) === '') {
            throw new GeminiException('backend_error', "I can't reply just now.", 502, 'empty model response');
        }

        return ['text' => $fullText, 'prompt_tokens' => $promptTokens, 'completion_tokens' => $completionTokens];
    }

    /**
     * @param list<array<string,mixed>> $contents
     * @param list<array<string,mixed>> $functionDeclarations
     * @return array{text:string,function_calls:list<array{name:string,args:array,id:?string}>,model_parts:list<array<string,mixed>>,prompt_tokens:?int,completion_tokens:?int}
     */
    private function googleGenerate(string $systemInstruction, array $contents, array $functionDeclarations): array
    {
        $payload = [
            'systemInstruction' => ['parts' => [['text' => $systemInstruction]]],
            'contents' => $contents,
            'generationConfig' => ['temperature' => 0.4, 'maxOutputTokens' => 1024],
        ];
        if ($functionDeclarations !== []) {
            $payload['tools'] = [['functionDeclarations' => $functionDeclarations]];
        }

        $url = sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
            rawurlencode($this->model),
            rawurlencode($this->apiKey)
        );

        $json = $this->httpJson($url, ['Content-Type: application/json'], $payload);
        $parts = $json['candidates'][0]['content']['parts'] ?? [];
        if (!is_array($parts)) {
            $parts = [];
        }

        $text = '';
        $calls = [];
        foreach ($parts as $part) {
            if (!is_array($part)) {
                continue;
            }
            if (isset($part['text']) && is_string($part['text'])) {
                $text .= $part['text'];
            }
            if (isset($part['functionCall']) && is_array($part['functionCall'])) {
                $fc = $part['functionCall'];
                $args = is_array($fc['args'] ?? null) ? $fc['args'] : [];
                $calls[] = [
                    'name' => (string) ($fc['name'] ?? ''),
                    'args' => $args,
                    'id' => isset($fc['id']) ? (string) $fc['id'] : null,
                ];
            }
        }

        $usage = $json['usageMetadata'] ?? [];
        return [
            'text' => $text,
            'function_calls' => $calls,
            'model_parts' => $parts,
            'prompt_tokens' => isset($usage['promptTokenCount']) ? (int) $usage['promptTokenCount'] : null,
            'completion_tokens' => isset($usage['candidatesTokenCount']) ? (int) $usage['candidatesTokenCount'] : null,
        ];
    }

    /**
     * @param list<array<string,mixed>> $contents Gemini contents (may include functionCall / functionResponse parts)
     * @param list<array<string,mixed>> $functionDeclarations
     * @return array{text:string,function_calls:list<array{name:string,args:array,id:?string}>,model_parts:list<array<string,mixed>>,prompt_tokens:?int,completion_tokens:?int}
     */
    private function openRouterGenerate(string $systemInstruction, array $contents, array $functionDeclarations): array
    {
        $messages = [['role' => 'system', 'content' => $systemInstruction]];
        foreach ($contents as $turn) {
            if (!is_array($turn)) {
                continue;
            }
            $role = ($turn['role'] ?? '') === 'model' ? 'assistant' : 'user';
            $parts = $turn['parts'] ?? [];
            if (!is_array($parts)) {
                continue;
            }

            $textBits = [];
            $toolCalls = [];
            $toolResults = [];
            foreach ($parts as $part) {
                if (!is_array($part)) {
                    continue;
                }
                if (isset($part['text']) && is_string($part['text'])) {
                    $textBits[] = $part['text'];
                }
                if (isset($part['functionCall']) && is_array($part['functionCall'])) {
                    $fc = $part['functionCall'];
                    $id = (string) ($fc['id'] ?? ('call_' . bin2hex(random_bytes(6))));
                    $args = $fc['args'] ?? new \stdClass();
                    $toolCalls[] = [
                        'id' => $id,
                        'type' => 'function',
                        'function' => [
                            'name' => (string) ($fc['name'] ?? ''),
                            'arguments' => is_string($args) ? $args : json_encode($args, JSON_UNESCAPED_UNICODE),
                        ],
                    ];
                }
                if (isset($part['functionResponse']) && is_array($part['functionResponse'])) {
                    $fr = $part['functionResponse'];
                    $toolResults[] = [
                        'role' => 'tool',
                        'tool_call_id' => (string) ($fr['id'] ?? ($fr['name'] ?? 'tool')),
                        'name' => (string) ($fr['name'] ?? ''),
                        'content' => json_encode($fr['response'] ?? new \stdClass(), JSON_UNESCAPED_UNICODE),
                    ];
                }
            }

            if ($toolCalls !== []) {
                $messages[] = [
                    'role' => 'assistant',
                    'content' => $textBits !== [] ? implode("\n", $textBits) : null,
                    'tool_calls' => $toolCalls,
                ];
            } elseif ($toolResults !== []) {
                foreach ($toolResults as $tr) {
                    $messages[] = $tr;
                }
            } elseif ($textBits !== []) {
                $messages[] = ['role' => $role, 'content' => implode("\n", $textBits)];
            }
        }

        $payload = [
            'model' => $this->model,
            'messages' => $messages,
            'temperature' => 0.4,
            'max_tokens' => 1024,
        ];
        if ($functionDeclarations !== []) {
            $tools = [];
            foreach ($functionDeclarations as $decl) {
                $tools[] = [
                    'type' => 'function',
                    'function' => [
                        'name' => (string) ($decl['name'] ?? ''),
                        'description' => (string) ($decl['description'] ?? ''),
                        'parameters' => $decl['parameters'] ?? ['type' => 'object', 'properties' => new \stdClass()],
                    ],
                ];
            }
            $payload['tools'] = $tools;
        }

        $json = $this->httpJson(
            'https://openrouter.ai/api/v1/chat/completions',
            $this->openRouterHeaders(),
            $payload
        );

        $message = $json['choices'][0]['message'] ?? [];
        $text = (string) ($message['content'] ?? '');
        $calls = [];
        $modelParts = [];
        if ($text !== '') {
            $modelParts[] = ['text' => $text];
        }
        foreach ($message['tool_calls'] ?? [] as $tc) {
            if (!is_array($tc)) {
                continue;
            }
            $fn = $tc['function'] ?? [];
            $argsRaw = $fn['arguments'] ?? '{}';
            $args = is_string($argsRaw) ? json_decode($argsRaw, true) : $argsRaw;
            if (!is_array($args)) {
                $args = [];
            }
            $name = (string) ($fn['name'] ?? '');
            $id = isset($tc['id']) ? (string) $tc['id'] : null;
            $calls[] = ['name' => $name, 'args' => $args, 'id' => $id];
            $modelParts[] = [
                'functionCall' => [
                    'name' => $name,
                    'args' => $args,
                    'id' => $id,
                ],
            ];
        }

        $usage = $json['usage'] ?? [];
        return [
            'text' => $text,
            'function_calls' => $calls,
            'model_parts' => $modelParts,
            'prompt_tokens' => isset($usage['prompt_tokens']) ? (int) $usage['prompt_tokens'] : null,
            'completion_tokens' => isset($usage['completion_tokens']) ? (int) $usage['completion_tokens'] : null,
        ];
    }

    /**
     * @return list<string>
     */
    private function openRouterHeaders(): array
    {
        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey,
        ];
        $referer = getenv('OPENROUTER_HTTP_REFERER') ?: (getenv('BASE_URL') ?: 'https://sleeklybuilt.pro');
        $headers[] = 'HTTP-Referer: ' . $referer;
        $headers[] = 'X-Title: SleeklyBuilt Attendant';
        return $headers;
    }

    /**
     * @param list<string> $headers
     * @param array<string,mixed> $payload
     * @return array<string,mixed>
     */
    private function httpJson(string $url, array $headers, array $payload): array
    {
        $ch = curl_init($url);
        if ($ch === false) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502);
        }
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 90,
            CURLOPT_CONNECTTIMEOUT => 15,
        ]);
        $raw = curl_exec($ch);
        $httpStatus = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502, $curlErr !== '' ? $curlErr : 'curl failed');
        }
        $json = json_decode((string) $raw, true);
        if (!is_array($json)) {
            throw new GeminiException('backend_error', "I can't reply just now.", 502, 'invalid JSON');
        }
        if (isset($json['error']) || $httpStatus >= 400) {
            $detail = is_array($json['error'] ?? null)
                ? (string) ($json['error']['message'] ?? 'LLM error')
                : ('HTTP ' . $httpStatus);
            throw new GeminiException('backend_error', "I can't reply just now.", 502, $detail);
        }
        return $json;
    }

    /**
     * @param array<string,mixed> $json
     */
    private static function extractGoogleText(array $json): string
    {
        $out = '';
        foreach ($json['candidates'] ?? [] as $cand) {
            if (!is_array($cand)) {
                continue;
            }
            foreach ($cand['content']['parts'] ?? [] as $part) {
                if (is_array($part) && isset($part['text']) && is_string($part['text'])) {
                    $out .= $part['text'];
                }
            }
        }
        return $out;
    }
}
