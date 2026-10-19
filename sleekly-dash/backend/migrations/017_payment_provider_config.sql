-- Payment provider config (MTN / Airtel merchant identifiers).
-- Editable from Sleekly Dash Settings → Payments. Checkout reads active rows.

CREATE TABLE IF NOT EXISTS payment_provider_config (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO payment_provider_config (
  provider,
  display_name,
  merchant_identifier,
  is_active,
  display_order,
  payment_instructions,
  ussd_instruction
) VALUES
(
  'mtn',
  'MTN Mobile Money',
  '',
  1,
  1,
  'Open MTN MoMo, choose Payment / Merchant, enter the merchant code below, then send the exact deposit amount.',
  'Dial *165*3# then follow merchant payment prompts'
),
(
  'airtel',
  'Airtel Money',
  '',
  1,
  2,
  'Open Airtel Money, choose Pay / Merchant, enter the merchant number below, then send the exact deposit amount.',
  'Use Airtel Money app or USSD merchant pay with the number below'
)
ON DUPLICATE KEY UPDATE provider = provider;
