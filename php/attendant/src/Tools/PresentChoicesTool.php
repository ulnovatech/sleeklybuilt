<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ChoiceGate;
use Attendant\ToolContext;
use Attendant\ToolResults;

/**
 * Present progressive A/B/C choices for the Decision UI (not a chip wall on empty).
 */
final class PresentChoicesTool implements AttendantTool
{
    public function __construct(private ChoiceGate $choices)
    {
    }

    public function name(): string
    {
        return 'present_choices';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' =>
                'Show the visitor 2–5 short choice chips (e.g. public site vs logins). '
                . 'Use during qualify/recommend when one decision unblocks the next step. '
                . 'Each option may include model_patch fields to persist on selection.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'prompt' => [
                        'type' => 'string',
                        'description' => 'Short question shown above the chips',
                    ],
                    'options' => [
                        'type' => 'array',
                        'description' => '2–5 options with id, label, optional model_patch object',
                    ],
                    'multi' => [
                        'type' => 'boolean',
                        'description' => 'Allow multiple selections (default false)',
                    ],
                ],
                'required' => ['prompt', 'options'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $prompt = trim((string) ($args['prompt'] ?? ''));
        if ($prompt === '' || mb_strlen($prompt) > 240) {
            return ToolResults::fail($this->name(), 'validation_error', 'Choice prompt is missing or too long.');
        }

        $rawOptions = $args['options'] ?? null;
        if (!is_array($rawOptions) || count($rawOptions) < 2 || count($rawOptions) > 5) {
            return ToolResults::fail($this->name(), 'validation_error', 'Provide 2 to 5 choice options.');
        }

        $options = [];
        foreach ($rawOptions as $row) {
            if (!is_array($row)) {
                continue;
            }
            $id = preg_replace('/[^a-z0-9_\-]/i', '', (string) ($row['id'] ?? '')) ?? '';
            $id = strtolower(substr($id, 0, 40));
            $label = trim((string) ($row['label'] ?? ''));
            if ($id === '' || $label === '' || mb_strlen($label) > 80) {
                continue;
            }
            $patch = isset($row['model_patch']) && is_array($row['model_patch'])
                ? $row['model_patch']
                : [];
            $options[] = [
                'id' => $id,
                'label' => $label,
                'model_patch' => $patch,
            ];
        }

        if (count($options) < 2) {
            return ToolResults::fail($this->name(), 'validation_error', 'Choice options were invalid.');
        }

        $multi = !empty($args['multi']);
        $payload = [
            'prompt' => $prompt,
            'options' => $options,
            'multi' => $multi,
        ];

        $pending = $this->choices->createPending(
            $ctx->conversationId,
            $payload,
            $prompt
        );

        return ToolResults::ok(
            $this->name(),
            [
                'token' => $pending['token'],
                'choice_id' => $pending['choice_id'],
                'prompt' => $prompt,
                'options' => array_map(static fn (array $o): array => [
                    'id' => $o['id'],
                    'label' => $o['label'],
                ], $options),
                'multi' => $multi,
                'expires_at' => $pending['expires_at'],
            ],
            'await_choice',
            $prompt
        );
    }
}
