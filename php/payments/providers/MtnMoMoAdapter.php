<?php

declare(strict_types=1);

require_once __DIR__ . '/Contract.php';
require_once __DIR__ . '/normalize.php';

/**
 * Future official MTN MoMo merchant API adapter.
 *
 * Disabled until MTN_MOMO_API_ENABLED=true and required credentials exist.
 * Does not invent transactions. Does not scrape SMS.
 */
class UlnMtnMoMoAdapter implements UlnPaymentProviderAdapter
{
    public function providerId(): string
    {
        return 'mtn';
    }

    public function displayName(): string
    {
        return 'MTN Mobile Money (official API)';
    }

    public function isEnabled(): bool
    {
        return $this->envFlag('MTN_MOMO_API_ENABLED') && $this->missingDependencies() === [];
    }

    /** @return list<string> */
    private function missingDependencies(): array
    {
        $missing = [];
        if (!$this->envFlag('MTN_MOMO_API_ENABLED')) {
            $missing[] = 'MTN_MOMO_API_ENABLED=true';
        }
        foreach (['MTN_MOMO_API_BASE_URL', 'MTN_MOMO_API_PRIMARY_KEY', 'MTN_MOMO_API_USER_ID', 'MTN_MOMO_API_USER_SECRET'] as $key) {
            if (trim((string) (getenv($key) ?: '')) === '') {
                $missing[] = $key;
            }
        }
        return $missing;
    }

    private function envFlag(string $key): bool
    {
        $v = strtolower(trim((string) (getenv($key) ?: '')));
        return in_array($v, ['1', 'true', 'yes', 'on'], true);
    }

    public function capabilities(): array
    {
        $missing = $this->missingDependencies();
        return [
            'provider' => 'mtn',
            'display_name' => $this->displayName(),
            'enabled' => $this->isEnabled(),
            'mode' => 'official_api_stub',
            'can_fetch' => false,
            'can_webhook' => false,
            'missing_dependencies' => $missing,
            'notes' => $missing === []
                ? 'Credentials present, but live MTN Collection/Disbursement HTTP client is not wired yet. Do not enable in production until the HTTP client is implemented against official docs.'
                : 'Waiting on official MTN MoMo API access. Manual admin entry remains the production evidence path. SMS scraping is forbidden.',
        ];
    }

    public function fetchRecentTransactions(array $options = []): array
    {
        if (!$this->isEnabled()) {
            throw new RuntimeException(
                'MTN MoMo API adapter is not configured. Missing: ' . implode(', ', $this->missingDependencies())
            );
        }
        // Boundary: credentials may exist, but we refuse fake pulls.
        throw new RuntimeException(
            'MTN MoMo API HTTP client is not implemented yet. Configure credentials only when ready to wire the official Collections API — never use SMS scraping.'
        );
    }

    public function normalizeRawTransaction(array $raw): array
    {
        // Accept common future field aliases without requiring live API today.
        $ref = (string) ($raw['financialTransactionId']
            ?? $raw['externalId']
            ?? $raw['transaction_reference']
            ?? $raw['reference']
            ?? '');
        $phone = (string) ($raw['payer']['partyId']
            ?? $raw['payer']['msisdn']
            ?? $raw['actual_payer_phone']
            ?? $raw['msisdn']
            ?? '');
        $amount = (int) round((float) ($raw['amount'] ?? $raw['amount_ugx'] ?? 0));
        $at = (string) ($raw['eventDate']
            ?? $raw['transaction_at']
            ?? $raw['created_at']
            ?? '');
        $name = isset($raw['payer']['partyIdType']) ? null : (isset($raw['actual_payer_name']) ? (string) $raw['actual_payer_name'] : null);

        return uln_payment_normalized_txn(
            'mtn',
            $ref,
            $phone,
            $amount,
            $at !== '' ? $at : 'now',
            $name,
            (string) ($raw['currency'] ?? 'UGX'),
            isset($raw['payeeNote']) ? (string) $raw['payeeNote'] : null,
            $ref,
            isset($raw['notes']) ? (string) $raw['notes'] : 'Normalized from MTN API payload shape',
            'mtn_api'
        );
    }
}
