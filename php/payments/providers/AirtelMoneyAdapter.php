<?php

declare(strict_types=1);

require_once __DIR__ . '/Contract.php';
require_once __DIR__ . '/normalize.php';

/**
 * Future official Airtel Money merchant API adapter.
 *
 * Disabled until AIRTEL_MONEY_API_ENABLED=true and required credentials exist.
 * Does not invent transactions. Does not scrape SMS.
 */
class UlnAirtelMoneyAdapter implements UlnPaymentProviderAdapter
{
    public function providerId(): string
    {
        return 'airtel';
    }

    public function displayName(): string
    {
        return 'Airtel Money (official API)';
    }

    public function isEnabled(): bool
    {
        return $this->envFlag('AIRTEL_MONEY_API_ENABLED') && $this->missingDependencies() === [];
    }

    /** @return list<string> */
    private function missingDependencies(): array
    {
        $missing = [];
        if (!$this->envFlag('AIRTEL_MONEY_API_ENABLED')) {
            $missing[] = 'AIRTEL_MONEY_API_ENABLED=true';
        }
        foreach (['AIRTEL_MONEY_API_BASE_URL', 'AIRTEL_MONEY_API_CLIENT_ID', 'AIRTEL_MONEY_API_CLIENT_SECRET'] as $key) {
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
            'provider' => 'airtel',
            'display_name' => $this->displayName(),
            'enabled' => $this->isEnabled(),
            'mode' => 'official_api_stub',
            'can_fetch' => false,
            'can_webhook' => false,
            'missing_dependencies' => $missing,
            'notes' => $missing === []
                ? 'Credentials present, but live Airtel Money HTTP client is not wired yet. Do not enable in production until the HTTP client is implemented against official docs.'
                : 'Waiting on official Airtel Money API access. Manual admin entry remains the production evidence path. SMS scraping is forbidden.',
        ];
    }

    public function fetchRecentTransactions(array $options = []): array
    {
        if (!$this->isEnabled()) {
            throw new RuntimeException(
                'Airtel Money API adapter is not configured. Missing: ' . implode(', ', $this->missingDependencies())
            );
        }
        throw new RuntimeException(
            'Airtel Money API HTTP client is not implemented yet. Configure credentials only when ready to wire the official merchant API — never use SMS scraping.'
        );
    }

    public function normalizeRawTransaction(array $raw): array
    {
        $ref = (string) ($raw['transaction']['id']
            ?? $raw['transaction_id']
            ?? $raw['transaction_reference']
            ?? $raw['reference']
            ?? '');
        $phone = (string) ($raw['subscriber']['msisdn']
            ?? $raw['msisdn']
            ?? $raw['actual_payer_phone']
            ?? '');
        $amount = (int) round((float) ($raw['transaction']['amount'] ?? $raw['amount'] ?? $raw['amount_ugx'] ?? 0));
        $at = (string) ($raw['transaction']['date']
            ?? $raw['transaction_at']
            ?? $raw['created_at']
            ?? '');

        return uln_payment_normalized_txn(
            'airtel',
            $ref,
            $phone,
            $amount,
            $at !== '' ? $at : 'now',
            isset($raw['actual_payer_name']) ? (string) $raw['actual_payer_name'] : null,
            (string) ($raw['transaction']['currency'] ?? $raw['currency'] ?? 'UGX'),
            null,
            $ref,
            isset($raw['notes']) ? (string) $raw['notes'] : 'Normalized from Airtel API payload shape',
            'airtel_api'
        );
    }
}
