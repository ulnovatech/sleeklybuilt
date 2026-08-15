<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Loads prompts, rules, and skills from attendant/ — never duplicates personality in PHP strings.
 */
final class PromptComposer
{
    private string $root;

    public function __construct(?string $contractDir = null)
    {
        $this->root = $contractDir ?? attendant_contract_dir();
    }

    /**
     * @param list<string> $activeSkills
     * @param list<string> $allowedTools
     * @param array{
     *   page_json:string,
     *   visible_json:string,
     *   draft_json:string,
     *   pending_json:string,
     *   company_json:string,
     *   retrieved_json:string
     * } $contextBlocks
     * @param list<array<string,mixed>> $toolDeclarations
     * @return array{system:string,skill_ids:list<string>,prompt_hash:string}
     */
    public function compose(array $activeSkills, array $allowedTools, array $contextBlocks, array $toolDeclarations = []): array
    {
        $parts = [];

        $parts[] = $this->readRequired('prompts/system.md');
        foreach ($this->ruleFiles() as $rulePath) {
            $parts[] = $this->readRequired($rulePath);
        }
        $parts[] = $this->readRequired('prompts/response-policy.md');

        $contextTpl = $this->readRequired('prompts/context-builder.md');
        $parts[] = strtr($contextTpl, [
            '{{page_json}}' => $contextBlocks['page_json'],
            '{{visible_json}}' => $contextBlocks['visible_json'],
            '{{draft_json}}' => $contextBlocks['draft_json'],
            '{{pending_json}}' => $contextBlocks['pending_json'],
            '{{company_json}}' => $contextBlocks['company_json'],
            '{{retrieved_json}}' => $contextBlocks['retrieved_json'],
        ]);

        $skillTpl = $this->readRequired('prompts/skill-injection.md');
        $parts[] = strtr($skillTpl, [
            '{{active_skill_ids}}' => json_encode(array_values($activeSkills), JSON_UNESCAPED_UNICODE),
            '{{allowed_tool_names}}' => json_encode(array_values($allowedTools), JSON_UNESCAPED_UNICODE),
        ]);

        foreach ($activeSkills as $skillId) {
            $skillFile = 'skills/' . $skillId . '.md';
            $path = $this->root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $skillFile);
            if (!is_file($path)) {
                throw new \RuntimeException("Skill file missing: {$skillId}");
            }
            $parts[] = "## Skill: {$skillId}\n\n" . trim((string) file_get_contents($path));
        }

        if ($toolDeclarations === []) {
            $parts[] = "## Tool declarations\n\n"
                . "No tools are allowed this turn. Answer from context and rules only. Do not invent tool results.";
        } else {
            $parts[] = "## Tool declarations\n\n"
                . "Use only these tools via the API function-calling interface. Do not invent results.\n\n"
                . json_encode($toolDeclarations, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        }

        $system = implode("\n\n---\n\n", $parts);
        return [
            'system' => $system,
            'skill_ids' => array_values($activeSkills),
            'prompt_hash' => hash('sha256', $system),
        ];
    }

    /**
     * @return list<string>
     */
    public function ruleFiles(): array
    {
        $dir = $this->root . DIRECTORY_SEPARATOR . 'rules';
        $files = glob($dir . DIRECTORY_SEPARATOR . '*.md') ?: [];
        sort($files, SORT_STRING);
        $relative = [];
        foreach ($files as $abs) {
            $relative[] = 'rules/' . basename($abs);
        }
        for ($i = 0; $i <= 12; $i++) {
            $prefix = sprintf('rules/%02d_', $i);
            $found = false;
            foreach ($relative as $rel) {
                if (str_starts_with($rel, $prefix)) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                throw new \RuntimeException('Missing rule file for index ' . sprintf('%02d', $i));
            }
        }
        return $relative;
    }

    private function readRequired(string $relative): string
    {
        $path = $this->root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
        if (!is_file($path)) {
            throw new \RuntimeException("Attendant contract file missing: {$relative}");
        }
        $raw = file_get_contents($path);
        if ($raw === false || trim($raw) === '') {
            throw new \RuntimeException("Attendant contract file empty: {$relative}");
        }
        return trim($raw);
    }
}
