<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ContextEngine;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class HandoffTool implements AttendantTool
{
    public function __construct(private ContextEngine $context)
    {
    }

    public function name(): string
    {
        return 'handoff';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Return public human contact channels (WhatsApp, phone, email). Does not send a message.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'reason' => ['type' => 'string'],
                ],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $contact = $this->loadPublicContact($ctx->pdo);
        if ($contact === null) {
            $company = $this->context->companyRecord();
            $contact = [
                'whatsapp_url' => $company['whatsapp_url'] ?? null,
                'primary_phone' => $company['primary_phone'] ?? null,
                'email' => $company['email'] ?? null,
                'phones' => $company['phones'] ?? [],
            ];
        }

        if (empty($contact['email']) && empty($contact['whatsapp_url']) && empty($contact['primary_phone'])) {
            return ToolResults::fail($this->name(), 'backend_error', 'I couldn\'t load contact details just now.');
        }

        return ToolResults::ok($this->name(), [
            'whatsapp_url' => $contact['whatsapp_url'] ?? null,
            'primary_phone' => $contact['primary_phone'] ?? null,
            'email' => $contact['email'] ?? null,
            'phones' => $contact['phones'] ?? [],
            'reason' => isset($args['reason']) ? (string) $args['reason'] : null,
        ]);
    }

    /**
     * @return array<string,mixed>|null
     */
    private function loadPublicContact(?\PDO $pdo): ?array
    {
        if (!$pdo instanceof \PDO) {
            return null;
        }
        try {
            $stmt = $pdo->query(
                'SELECT email, phones_json, primary_phone, whatsapp_url
                 FROM site_contact_settings WHERE id = 1 LIMIT 1'
            );
            $row = $stmt ? $stmt->fetch() : false;
            if (!$row) {
                return null;
            }
            $phones = json_decode((string) ($row['phones_json'] ?? '[]'), true);
            return [
                'email' => $row['email'] ?? null,
                'primary_phone' => $row['primary_phone'] ?? null,
                'whatsapp_url' => $row['whatsapp_url'] ?? null,
                'phones' => is_array($phones) ? $phones : [],
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }
}
