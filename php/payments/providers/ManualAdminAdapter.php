<?php

declare(strict_types=1);

require_once __DIR__ . '/Contract.php';

/**
 * Current production evidence path: administrator records merchant account/SMS evidence.
 * This is intentional — not a placeholder for SMS scraping.
 */
class UlnManualAdminPaymentAdapter implements UlnPaymentProviderAdapter
{
    public function providerId(): string
    {
        return 'manual';
    }

    public function displayName(): string
    {
        return 'Manual admin entry';
    }

    public function isEnabled(): bool
    {
        return true;
    }

    public function capabilities(): array
    {
        return [
            'provider' => 'manual',
            'display_name' => $this->displayName(),
            'enabled' => true,
            'mode' => 'admin_entry',
            'can_fetch' => false,
            'can_webhook' => false,
            'missing_dependencies' => [],
            'notes' => 'Production path today: admin enters merchant SMS/account evidence in Payments → Review. No device SMS scrape.',
        ];
    }

    public function fetchRecentTransactions(array $options = []): array
    {
        throw new RuntimeException(
            'Manual adapter does not fetch transactions. Use admin Payments UI or enable an official MTN/Airtel API adapter.'
        );
    }

    public function normalizeRawTransaction(array $raw): array
    {
        require_once __DIR__ . '/normalize.php';

        return uln_payment_normalized_txn(
            (string) ($raw['provider'] ?? ''),
            (string) ($raw['transaction_reference'] ?? $raw['reference'] ?? ''),
            (string) ($raw['actual_payer_phone'] ?? $raw['payer_phone'] ?? ''),
            (int) ($raw['amount_ugx'] ?? $raw['amount'] ?? 0),
            (string) ($raw['transaction_at'] ?? ''),
            isset($raw['actual_payer_name']) ? (string) $raw['actual_payer_name'] : (isset($raw['payer_name']) ? (string) $raw['payer_name'] : null),
            (string) ($raw['currency'] ?? 'UGX'),
            isset($raw['merchant_context']) ? (string) $raw['merchant_context'] : null,
            isset($raw['evidence_reference']) ? (string) $raw['evidence_reference'] : null,
            isset($raw['notes']) ? (string) $raw['notes'] : null,
            'manual_admin'
        );
    }
}
