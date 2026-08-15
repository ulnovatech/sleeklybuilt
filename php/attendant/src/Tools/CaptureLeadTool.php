<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class CaptureLeadTool implements AttendantTool
{
    public function name(): string
    {
        return 'capture_lead';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Submit a contact lead. Requires visitor confirmation before it runs.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'name' => ['type' => 'string'],
                    'phone' => ['type' => 'string'],
                    'email' => ['type' => 'string'],
                    'subject' => ['type' => 'string'],
                    'message' => ['type' => 'string'],
                    'intent' => ['type' => 'string'],
                    'submission_key' => ['type' => 'string'],
                ],
                'required' => ['name', 'phone', 'email', 'subject', 'message'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $name = trim((string) ($args['name'] ?? ''));
        $phone = trim((string) ($args['phone'] ?? ''));
        $email = trim((string) ($args['email'] ?? ''));
        $subject = trim((string) ($args['subject'] ?? ''));
        $message = trim((string) ($args['message'] ?? ''));
        $intent = trim((string) ($args['intent'] ?? 'attendant'));
        $submissionKey = trim((string) ($args['submission_key'] ?? ''));

        if ($name === '' || $phone === '' || $email === '' || $subject === '' || $message === '') {
            return ToolResults::fail($this->name(), 'validation_error', 'Name, phone, email, subject, and message are required.');
        }

        if (!$ctx->confirmed) {
            if ($ctx->gate === null) {
                return ToolResults::fail($this->name(), 'backend_error', 'I couldn\'t complete that just now.');
            }
            $summary = "Send contact request for {$name} ({$email}, {$phone}): {$subject}";
            return $ctx->gate->interceptWrite($ctx->conversationId, $this->name(), [
                'name' => $name,
                'phone' => $phone,
                'email' => $email,
                'subject' => $subject,
                'message' => $message,
                'intent' => $intent,
                'submission_key' => $submissionKey,
            ], $summary);
        }

        if (!str_contains($message, 'source: attendant') && !str_contains($message, '[Source: attendant]')) {
            $message .= "\n\n[Source: attendant]\n[Conversation: {$ctx->conversationId}]";
        }

        require_once dirname(__DIR__, 3) . '/leads/contact_submit.php';
        $result = uln_contact_submit([
            'name' => $name,
            'phone' => $phone,
            'email' => $email,
            'subject' => $subject,
            'message' => $message,
            'intent' => $intent !== '' ? $intent : 'attendant',
            'submission_key' => $submissionKey,
        ]);

        if (!($result['ok'] ?? false)) {
            $code = ((int) ($result['http'] ?? 500)) === 429 ? 'rate_limited' : 'backend_error';
            if ((int) ($result['http'] ?? 0) === 400) {
                $code = 'validation_error';
            }
            return ToolResults::fail(
                $this->name(),
                $code,
                (string) ($result['message'] ?? 'I couldn\'t send that just now.'),
                'none'
            );
        }

        return ToolResults::ok($this->name(), [
            'reference' => (string) ($result['reference'] ?? ''),
            'status' => 'success',
            'message' => (string) ($result['message'] ?? ''),
        ], 'writes_lead');
    }
}
