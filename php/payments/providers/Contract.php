<?php

declare(strict_types=1);

/**
 * Official MoMo provider adapter contract.
 *
 * Current production evidence path is ManualAdminAdapter (admin enters merchant SMS/account).
 * MTN/Airtel adapters stay disabled until official API credentials exist.
 *
 * Absolute: no unofficial SMS scraping; no invented transactions.
 */

interface UlnPaymentProviderAdapter
{
    /** mtn | airtel | manual */
    public function providerId(): string;

    public function displayName(): string;

    /**
     * Whether this adapter can pull or accept live provider evidence today.
     */
    public function isEnabled(): bool;

    /**
     * Capability / readiness report (no secrets).
     *
     * @return array{
     *   provider:string,
     *   display_name:string,
     *   enabled:bool,
     *   mode:string,
     *   can_fetch:bool,
     *   can_webhook:bool,
     *   missing_dependencies:list<string>,
     *   notes:string
     * }
     */
    public function capabilities(): array;

    /**
     * Fetch recent merchant transactions from the provider API (when enabled).
     *
     * @param array{since?:string,limit?:int} $options
     * @return list<array<string,mixed>> normalized transactions
     * @throws RuntimeException when not configured or provider error
     */
    public function fetchRecentTransactions(array $options = []): array;

    /**
     * Normalize a raw provider webhook/API payload into the common transaction model.
     *
     * @param array<string,mixed> $raw
     * @return array<string,mixed> normalized transaction
     * @throws InvalidArgumentException when payload cannot be normalized
     */
    public function normalizeRawTransaction(array $raw): array;
}
