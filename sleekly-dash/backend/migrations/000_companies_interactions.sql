-- Core CRM tables for sleekly-dash.
-- This migration intentionally creates the foundational tables used by:
--   - CompanyController
--   - InteractionController
--   - ImportController / RequestsController / ProspectsController conversions
--
-- Run once:
--   php sleekly-dash/backend/scripts/apply_crm_foundation_migration.php

CREATE TABLE IF NOT EXISTS companies (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NULL,
  website_url VARCHAR(512) NULL,
  has_website TINYINT(1) NOT NULL DEFAULT 0,
  location VARCHAR(255) NULL,
  contact_person VARCHAR(255) NULL,
  contact_method ENUM('phone','email','whatsapp','other') NOT NULL DEFAULT 'whatsapp',
  contact_phone VARCHAR(64) NULL,
  contact_email VARCHAR(255) NULL,
  contact_whatsapp VARCHAR(64) NULL,
  status ENUM('not_contacted','contacted','interested','in_negotiation','closed_won','closed_lost') NOT NULL DEFAULT 'not_contacted',
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  last_contact_date DATE NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_companies_name (name),
  KEY idx_companies_status (status),
  KEY idx_companies_priority (priority),
  KEY idx_companies_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id INT UNSIGNED NOT NULL,
  channel ENUM('phone','email','whatsapp','other') NOT NULL DEFAULT 'whatsapp',
  outcome VARCHAR(64) NOT NULL DEFAULT 'no_reply',
  notes TEXT NULL,
  happened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_interactions_company_time (company_id, happened_at),
  CONSTRAINT fk_interactions_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
