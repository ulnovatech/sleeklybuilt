<?php

declare(strict_types=1);

/**
 * MoMo payment schema — provider config, claims, transactions, verify, receipts, audit.
 */

function uln_ensure_payment_provider_config(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_provider_config (
            id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            provider VARCHAR(32) NOT NULL,
            display_name VARCHAR(120) NOT NULL,
            merchant_identifier VARCHAR(64) NOT NULL DEFAULT '',
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            display_order SMALLINT NOT NULL DEFAULT 0,
            payment_instructions TEXT NOT NULL,
            ussd_instruction VARCHAR(255) NOT NULL DEFAULT '',
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            updated_by VARCHAR(120) NULL,
            UNIQUE KEY uq_payment_provider (provider)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $stmt = $pdo->prepare(
        'INSERT INTO payment_provider_config
         (provider, display_name, merchant_identifier, is_active, display_order, payment_instructions, ussd_instruction)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE provider = provider'
    );
    $stmt->execute([
        'mtn',
        'MTN Mobile Money',
        '',
        1,
        1,
        'Open MTN MoMo, choose Payment / Merchant, enter the merchant code below, then send the exact deposit amount.',
        'Dial *165*3# then follow merchant payment prompts',
    ]);
    $stmt->execute([
        'airtel',
        'Airtel Money',
        '',
        1,
        2,
        'Open Airtel Money, choose Pay / Merchant, enter the merchant number below, then send the exact deposit amount.',
        'Use Airtel Money app or USSD merchant pay with the number below',
    ]);
}

function uln_ensure_payment_claims_tables(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_sessions (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            session_ref VARCHAR(40) NOT NULL,
            template_key VARCHAR(255) NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(64) NOT NULL,
            country_code VARCHAR(8) NOT NULL DEFAULT '+256',
            business_name VARCHAR(255) NULL,
            notes TEXT NULL,
            package VARCHAR(32) NOT NULL,
            amount_ugx INT UNSIGNED NOT NULL,
            currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
            provider VARCHAR(32) NULL,
            merchant_identifier_snapshot VARCHAR(64) NULL,
            status VARCHAR(40) NOT NULL DEFAULT 'awaiting_payment',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_payment_sessions_ref (session_ref),
            KEY idx_payment_sessions_status (status),
            KEY idx_payment_sessions_phone (customer_phone)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_claims (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            claim_ref VARCHAR(40) NOT NULL,
            payment_session_id INT UNSIGNED NOT NULL,
            provider VARCHAR(32) NOT NULL,
            payer_is_customer TINYINT(1) NOT NULL DEFAULT 1,
            claimed_payer_name VARCHAR(255) NULL,
            claimed_payer_phone VARCHAR(64) NULL,
            status VARCHAR(40) NOT NULL DEFAULT 'awaiting_verification',
            submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            metadata JSON NULL,
            UNIQUE KEY uq_payment_claims_ref (claim_ref),
            KEY idx_payment_claims_status (status),
            KEY idx_payment_claims_session (payment_session_id),
            CONSTRAINT fk_payment_claims_session
              FOREIGN KEY (payment_session_id) REFERENCES payment_sessions(id)
              ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function uln_ensure_payment_verify_tables(PDO $pdo): void
{
    uln_ensure_payment_claims_tables($pdo);

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_transactions (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            provider VARCHAR(32) NOT NULL,
            transaction_reference VARCHAR(120) NOT NULL,
            actual_payer_phone VARCHAR(64) NOT NULL,
            actual_payer_name VARCHAR(255) NULL,
            amount_ugx INT UNSIGNED NOT NULL,
            currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
            transaction_at DATETIME NOT NULL,
            merchant_context VARCHAR(120) NULL,
            notes TEXT NULL,
            status VARCHAR(40) NOT NULL DEFAULT 'recorded',
            created_by VARCHAR(120) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_payment_txn_provider_ref (provider, transaction_reference),
            KEY idx_payment_txn_status (status),
            KEY idx_payment_txn_amount (amount_ugx)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_verifications (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            payment_claim_id INT UNSIGNED NOT NULL,
            payment_transaction_id INT UNSIGNED NOT NULL,
            result VARCHAR(40) NOT NULL,
            confidence VARCHAR(40) NOT NULL DEFAULT 'manual',
            matching_summary JSON NULL,
            notes TEXT NULL,
            verified_by VARCHAR(120) NOT NULL,
            verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_payment_verifications_claim (payment_claim_id),
            KEY idx_payment_verifications_txn (payment_transaction_id),
            CONSTRAINT fk_payment_verifications_claim
              FOREIGN KEY (payment_claim_id) REFERENCES payment_claims(id)
              ON DELETE CASCADE,
            CONSTRAINT fk_payment_verifications_txn
              FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id)
              ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_allocations (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            payment_transaction_id INT UNSIGNED NOT NULL,
            payment_session_id INT UNSIGNED NOT NULL,
            payment_claim_id INT UNSIGNED NOT NULL,
            allocated_amount INT UNSIGNED NOT NULL,
            allocated_by VARCHAR(120) NOT NULL,
            allocated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_payment_alloc_txn (payment_transaction_id),
            KEY idx_payment_alloc_session (payment_session_id),
            CONSTRAINT fk_payment_alloc_txn
              FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id)
              ON DELETE RESTRICT,
            CONSTRAINT fk_payment_alloc_session
              FOREIGN KEY (payment_session_id) REFERENCES payment_sessions(id)
              ON DELETE CASCADE,
            CONSTRAINT fk_payment_alloc_claim
              FOREIGN KEY (payment_claim_id) REFERENCES payment_claims(id)
              ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_receipts (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            receipt_number VARCHAR(40) NOT NULL,
            payment_claim_id INT UNSIGNED NOT NULL,
            payment_session_id INT UNSIGNED NOT NULL,
            payment_transaction_id INT UNSIGNED NOT NULL,
            amount_ugx INT UNSIGNED NOT NULL,
            currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
            status VARCHAR(40) NOT NULL DEFAULT 'issued',
            issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_payment_receipt_number (receipt_number),
            KEY idx_payment_receipts_claim (payment_claim_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS payment_audit_events (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            entity_type VARCHAR(40) NOT NULL,
            entity_id VARCHAR(64) NOT NULL,
            action VARCHAR(64) NOT NULL,
            actor VARCHAR(120) NULL,
            before_json JSON NULL,
            after_json JSON NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_payment_audit_entity (entity_type, entity_id),
            KEY idx_payment_audit_action (action)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function uln_generate_claim_ref(): string
{
    return 'SB-PAY-' . strtoupper(bin2hex(random_bytes(4)));
}

function uln_generate_receipt_number(): string
{
    return 'SB-RCPT-' . strtoupper(bin2hex(random_bytes(4)));
}

/**
 * @return list<array{provider:string,display_name:string,merchant_identifier:string,display_order:int,payment_instructions:string,ussd_instruction:string,configured:bool}>
 */
function uln_load_active_payment_providers(PDO $pdo): array
{
    uln_ensure_payment_provider_config($pdo);

    $rows = $pdo->query(
        'SELECT provider, display_name, merchant_identifier, display_order,
                payment_instructions, ussd_instruction
         FROM payment_provider_config
         WHERE is_active = 1
         ORDER BY display_order ASC, id ASC'
    )->fetchAll();

    $out = [];
    foreach ($rows as $row) {
        $merchant = trim((string) ($row['merchant_identifier'] ?? ''));
        $out[] = [
            'provider' => (string) $row['provider'],
            'display_name' => (string) $row['display_name'],
            'merchant_identifier' => $merchant,
            'display_order' => (int) $row['display_order'],
            'payment_instructions' => (string) ($row['payment_instructions'] ?? ''),
            'ussd_instruction' => (string) ($row['ussd_instruction'] ?? ''),
            'configured' => $merchant !== '',
        ];
    }

    return $out;
}

function uln_payment_audit(
    PDO $pdo,
    string $entityType,
    string $entityId,
    string $action,
    ?string $actor,
    ?array $before,
    ?array $after
): void {
    $stmt = $pdo->prepare(
        'INSERT INTO payment_audit_events (entity_type, entity_id, action, actor, before_json, after_json)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $entityType,
        $entityId,
        $action,
        $actor,
        $before === null ? null : json_encode($before, JSON_UNESCAPED_UNICODE),
        $after === null ? null : json_encode($after, JSON_UNESCAPED_UNICODE),
    ]);
}

function uln_payment_phone_digits(string $phone): string
{
    return preg_replace('/\D+/', '', $phone) ?: '';
}

function uln_payment_phones_match(string $a, string $b): bool
{
    $da = uln_payment_phone_digits($a);
    $db = uln_payment_phone_digits($b);
    if ($da === '' || $db === '') {
        return false;
    }
    if ($da === $db) {
        return true;
    }
    $ta = substr($da, -9);
    $tb = substr($db, -9);
    return strlen($ta) >= 9 && $ta === $tb;
}
