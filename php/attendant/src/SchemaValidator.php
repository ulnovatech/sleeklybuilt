<?php

declare(strict_types=1);

namespace Attendant;

final class SchemaValidator
{
    private string $schemasDir;

    public function __construct(?string $schemasDir = null)
    {
        $this->schemasDir = $schemasDir ?? (attendant_contract_dir() . DIRECTORY_SEPARATOR . 'schemas');
    }

    /**
     * @return array{ok:bool,value?:array,error?:string}
     */
    public function validateContext(array $input): array
    {
        $schema = $this->loadJson('context.json');
        $props = $schema['properties'] ?? [];
        $required = $schema['required'] ?? [];
        $out = [];

        foreach ($required as $key) {
            if (!array_key_exists($key, $input) || $input[$key] === null || $input[$key] === '') {
                return ['ok' => false, 'error' => "Missing required field: {$key}"];
            }
        }

        foreach ($input as $key => $value) {
            if (!isset($props[$key])) {
                // additionalProperties: false — drop unknown rather than fail hard for forward compat of optional client fields
                continue;
            }
            // Unknown page_id is stored as unknown (never trusted as a destination)
            if ($key === 'page_id' && is_string($value)) {
                $allowedPages = $props['page_id']['enum'] ?? [];
                if (!in_array($value, $allowedPages, true)) {
                    $value = 'unknown';
                }
            }
            $check = $this->checkProperty($props[$key], $value, $key);
            if ($check !== null) {
                return ['ok' => false, 'error' => $check];
            }
            $out[$key] = $value;
        }

        if (!isset($out['page_id'])) {
            return ['ok' => false, 'error' => 'Missing required field: page_id'];
        }

        if (!isset($out['current_url']) || !is_string($out['current_url'])) {
            return ['ok' => false, 'error' => 'current_url must be a string'];
        }
        if (strlen($out['current_url']) > 2048) {
            return ['ok' => false, 'error' => 'current_url too long'];
        }

        if (isset($out['recent_page_ids']) && is_array($out['recent_page_ids'])) {
            $out['recent_page_ids'] = array_slice(array_values(array_filter($out['recent_page_ids'], 'is_string')), 0, 8);
        }

        return ['ok' => true, 'value' => $out];
    }

    /**
     * @return array{ok:bool,error?:string}
     */
    public function validateToolResult(array $result): array
    {
        foreach (['ok', 'tool', 'code', 'side_effects'] as $key) {
            if (!array_key_exists($key, $result)) {
                return ['ok' => false, 'error' => "tool-result missing {$key}"];
            }
        }
        if (!is_bool($result['ok'])) {
            return ['ok' => false, 'error' => 'tool-result.ok must be boolean'];
        }
        $sides = ['none', 'client_navigation', 'writes_lead', 'writes_quote', 'await_choice'];
        if (!in_array($result['side_effects'], $sides, true)) {
            return ['ok' => false, 'error' => 'invalid side_effects'];
        }
        if ($result['ok'] === true && !empty($result['confirmation_required'])) {
            return ['ok' => false, 'error' => 'ok true cannot set confirmation_required'];
        }
        if ($result['ok'] === false) {
            $codes = [
                'validation_error', 'unknown_destination', 'unknown_section', 'not_found',
                'ambiguous_id', 'confirmation_required', 'unauthorized', 'rate_limited',
                'backend_error', 'unsupported', 'escalation_not_allowed',
            ];
            if (!in_array($result['code'], $codes, true)) {
                return ['ok' => false, 'error' => 'invalid error code'];
            }
        }
        return ['ok' => true];
    }

    private function loadJson(string $name): array
    {
        $path = $this->schemasDir . DIRECTORY_SEPARATOR . $name;
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new \RuntimeException("Schema missing: {$name}");
        }
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            throw new \RuntimeException("Schema invalid JSON: {$name}");
        }
        return $decoded;
    }

    private function checkProperty(array $prop, mixed $value, string $key): ?string
    {
        $types = $prop['type'] ?? null;
        if ($types === null) {
            return null;
        }
        $allowed = is_array($types) ? $types : [$types];
        $actual = $this->phpType($value);
        // JSON `{}` decodes to `[]` in PHP — accept empty list as object when schema expects object.
        if ($actual === 'array' && $value === [] && in_array('object', $allowed, true)) {
            $actual = 'object';
        }
        if (!in_array($actual, $allowed, true) && !($value === null && in_array('null', $allowed, true))) {
            return "{$key} has invalid type";
        }
        if (isset($prop['enum']) && $value !== null && !in_array($value, $prop['enum'], true)) {
            return "{$key} has invalid value";
        }
        if (isset($prop['maxLength']) && is_string($value) && strlen($value) > (int) $prop['maxLength']) {
            return "{$key} too long";
        }
        if (isset($prop['maxItems']) && is_array($value) && count($value) > (int) $prop['maxItems']) {
            return "{$key} too many items";
        }
        return null;
    }

    private function phpType(mixed $value): string
    {
        return match (true) {
            is_null($value) => 'null',
            is_bool($value) => 'boolean',
            is_int($value) => 'integer',
            is_float($value) => 'number',
            is_string($value) => 'string',
            is_array($value) => $this->isList($value) ? 'array' : 'object',
            default => 'unknown',
        };
    }

    private function isList(array $value): bool
    {
        if ($value === []) {
            return true;
        }
        return array_keys($value) === range(0, count($value) - 1);
    }
}
