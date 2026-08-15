<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ProductCatalogue;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class StartOrderTool implements AttendantTool
{
    public function __construct(private ProductCatalogue $catalogue)
    {
    }

    public function name(): string
    {
        return 'start_order';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Create a quote-only website order. package must be basic|smart|premium. Requires confirmation. Not payment.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'template' => ['type' => 'string'],
                    'fullName' => ['type' => 'string'],
                    'phone' => ['type' => 'string'],
                    'countryCode' => ['type' => 'string'],
                    'businessName' => ['type' => 'string'],
                    'package' => [
                        'type' => 'string',
                        'enum' => ['basic', 'smart', 'premium'],
                    ],
                    'notes' => ['type' => 'string'],
                ],
                'required' => ['template', 'fullName', 'phone', 'package'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $template = trim((string) ($args['template'] ?? ''));
        $fullName = trim((string) ($args['fullName'] ?? ''));
        $phone = trim((string) ($args['phone'] ?? ''));
        $package = trim((string) ($args['package'] ?? ''));
        $countryCode = trim((string) ($args['countryCode'] ?? '+256'));
        $businessName = trim((string) ($args['businessName'] ?? ''));
        $notes = trim((string) ($args['notes'] ?? ''));

        if ($template === '') {
            $template = 'attendant-inquiry';
        }

        $allowed = $this->catalogue->orderableIds();
        if (!in_array($package, $allowed, true)) {
            return ToolResults::fail(
                $this->name(),
                'validation_error',
                'Checkout packages are basic, smart, or premium — not marketing display names like starter.'
            );
        }

        if ($fullName === '' || $phone === '') {
            return ToolResults::fail($this->name(), 'validation_error', 'Full name and phone are required for a quote.');
        }

        $payload = [
            'template' => $template,
            'fullName' => $fullName,
            'phone' => $phone,
            'countryCode' => $countryCode !== '' ? $countryCode : '+256',
            'businessName' => $businessName,
            'package' => $package,
            'notes' => $notes,
        ];

        if (!$ctx->confirmed) {
            if ($ctx->gate === null) {
                return ToolResults::fail($this->name(), 'backend_error', 'I couldn\'t complete that just now.');
            }
            $summary = "Request quote: {$package} package, layout {$template}, for {$fullName} ({$phone})";
            return $ctx->gate->interceptWrite($ctx->conversationId, $this->name(), $payload, $summary);
        }

        require_once dirname(__DIR__, 3) . '/leads/website_order_submit.php';
        $result = uln_website_order_quote($payload);

        if (!($result['ok'] ?? false)) {
            $http = (int) ($result['http'] ?? 500);
            $code = match ($http) {
                429 => 'rate_limited',
                400 => 'validation_error',
                default => 'backend_error',
            };
            return ToolResults::fail(
                $this->name(),
                $code,
                (string) ($result['message'] ?? 'I couldn\'t submit that quote just now.')
            );
        }

        return ToolResults::ok($this->name(), [
            'order_id' => $result['order_id'] ?? null,
            'success' => true,
            'message' => (string) ($result['message'] ?? ''),
            'reserved' => false,
        ], 'writes_quote');
    }
}
