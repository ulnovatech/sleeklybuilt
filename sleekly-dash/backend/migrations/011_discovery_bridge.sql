-- Discovery Intelligence ↔ sleekly-dash CRM bridge
-- Run: php sleekly-dash/backend/scripts/apply_discovery_bridge_migration.php

-- Prospects: link to Discovery account + score snapshot
ALTER TABLE prospects
  ADD COLUMN discovery_account_id VARCHAR(64) NULL AFTER source,
  ADD COLUMN discovery_score INT NULL AFTER discovery_account_id,
  ADD COLUMN discovery_payload JSON NULL AFTER discovery_score;

ALTER TABLE prospects
  ADD UNIQUE KEY uq_prospects_discovery_account (discovery_account_id);

-- Companies: outcome fields for closed-won/lost feedback into Discovery
ALTER TABLE companies
  ADD COLUMN discovery_account_id VARCHAR(64) NULL AFTER notes,
  ADD COLUMN closed_at DATETIME NULL AFTER discovery_account_id,
  ADD COLUMN project_value_ugx INT UNSIGNED NULL AFTER closed_at,
  ADD COLUMN services_sold JSON NULL AFTER project_value_ugx,
  ADD COLUMN loss_reason VARCHAR(500) NULL AFTER services_sold;

ALTER TABLE companies
  ADD KEY idx_companies_discovery_account (discovery_account_id),
  ADD KEY idx_companies_closed_at (closed_at),
  ADD KEY idx_companies_status_closed (status, closed_at);

-- Machine credentials for /api/integrations/* only (store SHA-256 hex of raw Bearer token)
CREATE TABLE IF NOT EXISTS integration_tokens (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  token_prefix VARCHAR(16) NOT NULL,
  token_hash CHAR(64) NOT NULL COMMENT 'sha256 hex of raw token',
  scopes JSON NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_used_at DATETIME NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_integration_tokens_hash (token_hash),
  KEY idx_integration_tokens_prefix (token_prefix),
  KEY idx_integration_tokens_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
