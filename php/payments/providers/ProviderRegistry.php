<?php

declare(strict_types=1);

require_once __DIR__ . '/Contract.php';
require_once __DIR__ . '/ManualAdminAdapter.php';
require_once __DIR__ . '/MtnMoMoAdapter.php';
require_once __DIR__ . '/AirtelMoneyAdapter.php';

/**
 * Registry of payment evidence adapters.
 */
class UlnPaymentProviderRegistry
{
    /** @var array<string,UlnPaymentProviderAdapter> */
    private array $adapters = [];

    public function __construct()
    {
        $this->register(new UlnManualAdminPaymentAdapter());
        $this->register(new UlnMtnMoMoAdapter());
        $this->register(new UlnAirtelMoneyAdapter());
    }

    public function register(UlnPaymentProviderAdapter $adapter): void
    {
        $this->adapters[$adapter->providerId()] = $adapter;
    }

    public function get(string $providerId): ?UlnPaymentProviderAdapter
    {
        $id = strtolower(trim($providerId));
        return $this->adapters[$id] ?? null;
    }

    /** @return list<UlnPaymentProviderAdapter> */
    public function all(): array
    {
        return array_values($this->adapters);
    }

    /** @return list<array<string,mixed>> */
    public function capabilityReport(): array
    {
        return array_map(
            static fn(UlnPaymentProviderAdapter $a): array => $a->capabilities(),
            $this->all()
        );
    }

    public function productionEvidencePath(): string
    {
        return 'manual';
    }
}
