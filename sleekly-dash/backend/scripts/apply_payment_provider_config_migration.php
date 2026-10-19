<?php

declare(strict_types=1);

/**
 * Apply MoMo payment provider config + verify schema on the shared payment DB (php/config).
 * Usage: php scripts/apply_payment_provider_config_migration.php
 */

require_once __DIR__ . '/../../../php/payments/db.php';
require_once __DIR__ . '/../../../php/payments/momo_schema.php';

$pdo = uln_payment_pdo();
uln_ensure_payment_provider_config($pdo);
uln_ensure_payment_verify_tables($pdo);

require_once __DIR__ . '/../../../php/payments/activate.php';
require_once __DIR__ . '/../../../php/payments/notify.php';
uln_ensure_payment_activation_tables($pdo);
uln_ensure_payment_notification_tables($pdo);

fwrite(STDOUT, "Payment provider config + verify + activation + notification tables ensured.\n");
fwrite(STDOUT, 'DB: ' . (uln_db_settings()['name'] ?? '?') . "\n");
