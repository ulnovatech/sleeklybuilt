<?php

declare(strict_types=1);

/**
 * Payment provider settings (MTN / Airtel merchant codes).
 * Uses shared payment DB (php/config) so checkout and Settings stay aligned.
 *
 * GET  /api/public/payment-providers — active providers for checkout
 * GET  /api/settings/payments — authenticated
 * PATCH /api/settings/payments — admin only
 */

require_once __DIR__ . '/../../../php/payments/db.php';
require_once __DIR__ . '/../../../php/payments/momo_schema.php';

class PaymentSettingsController
{
    private PDO $pdo;

    public function __construct(?PDO $pdo = null)
    {
        // Prefer shared payment DB; fall back to injected dash PDO only if payment DB unavailable.
        try {
            $this->pdo = $pdo && getenv('PAYMENT_USE_DASH_DB') === 'true'
                ? $pdo
                : uln_payment_pdo();
        } catch (Throwable $e) {
            if ($pdo instanceof PDO) {
                $this->pdo = $pdo;
            } else {
                throw $e;
            }
        }
        uln_ensure_payment_provider_config($this->pdo);
    }

    public function getPublicProviders(): array
    {
        $rows = uln_load_active_payment_providers($this->pdo);

        return [
            'providers' => array_map(static function (array $row): array {
                return [
                    'provider' => $row['provider'],
                    'display_name' => $row['display_name'],
                    'merchant_identifier' => $row['merchant_identifier'],
                    'display_order' => (int) $row['display_order'],
                    'payment_instructions' => $row['payment_instructions'],
                    'ussd_instruction' => $row['ussd_instruction'],
                    'configured' => $row['configured'],
                ];
            }, $rows),
        ];
    }

    public function getAdminProviders(): array
    {
        $rows = $this->pdo->query(
            'SELECT provider, display_name, merchant_identifier, is_active, display_order,
                    payment_instructions, ussd_instruction, updated_at, updated_by
             FROM payment_provider_config
             ORDER BY display_order ASC, id ASC'
        )->fetchAll();

        return [
            'providers' => array_map(static function (array $row): array {
                return [
                    'provider' => $row['provider'],
                    'display_name' => $row['display_name'],
                    'merchant_identifier' => $row['merchant_identifier'],
                    'is_active' => (bool) (int) $row['is_active'],
                    'display_order' => (int) $row['display_order'],
                    'payment_instructions' => $row['payment_instructions'],
                    'ussd_instruction' => $row['ussd_instruction'],
                    'updated_at' => $row['updated_at'],
                    'updated_by' => $row['updated_by'],
                ];
            }, $rows),
        ];
    }

    public function updateProviders(array $body, ?array $actor): array
    {
        $role = (string) ($actor['role'] ?? '');
        if ($role !== 'admin') {
            respond(['error' => 'Only admins can update payment settings.'], 403);
        }

        $providers = $body['providers'] ?? null;
        if (!is_array($providers) || $providers === []) {
            respond(['error' => 'Validation failed', 'details' => ['providers' => 'Required']], 422);
        }

        $updatedBy = trim((string) ($actor['email'] ?? $actor['name'] ?? $actor['id'] ?? 'admin'));

        $stmt = $this->pdo->prepare(
            'UPDATE payment_provider_config SET
                display_name = :display_name,
                merchant_identifier = :merchant_identifier,
                is_active = :is_active,
                display_order = :display_order,
                payment_instructions = :payment_instructions,
                ussd_instruction = :ussd_instruction,
                updated_by = :updated_by
             WHERE provider = :provider'
        );

        $errors = [];
        foreach ($providers as $i => $item) {
            if (!is_array($item)) {
                $errors["providers.$i"] = 'Invalid provider payload';
                continue;
            }
            $provider = strtolower(trim((string) ($item['provider'] ?? '')));
            if (!in_array($provider, ['mtn', 'airtel'], true)) {
                $errors["providers.$i.provider"] = 'Must be mtn or airtel';
                continue;
            }
            $isActive = !empty($item['is_active']);
            $merchant = trim((string) ($item['merchant_identifier'] ?? ''));
            if ($isActive && $merchant === '') {
                $errors["providers.{$provider}.merchant_identifier"] = 'Required when provider is active';
                continue;
            }
            $displayName = trim((string) ($item['display_name'] ?? ''));
            if ($displayName === '') {
                $displayName = $provider === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money';
            }

            $stmt->execute([
                ':display_name' => mb_substr($displayName, 0, 120),
                ':merchant_identifier' => mb_substr($merchant, 0, 64),
                ':is_active' => $isActive ? 1 : 0,
                ':display_order' => (int) ($item['display_order'] ?? ($provider === 'mtn' ? 1 : 2)),
                ':payment_instructions' => trim((string) ($item['payment_instructions'] ?? '')),
                ':ussd_instruction' => mb_substr(trim((string) ($item['ussd_instruction'] ?? '')), 0, 255),
                ':updated_by' => mb_substr($updatedBy, 0, 120),
                ':provider' => $provider,
            ]);
        }

        if ($errors !== []) {
            respond(['error' => 'Validation failed', 'details' => $errors], 422);
        }

        return $this->getAdminProviders();
    }
}
