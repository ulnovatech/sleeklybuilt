-- SleeklyBuilt Attendant — conversation state and telemetry
-- Apply: php php/attendant/scripts/apply_attendant_migration.php

CREATE TABLE IF NOT EXISTS attendant_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,
  ip_hash CHAR(64) NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendant_sessions_token (token_hash),
  KEY idx_attendant_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendant_conversations (
  id CHAR(32) NOT NULL PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  status ENUM('active', 'expired', 'cleared') NOT NULL DEFAULT 'active',
  draft_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendant_conversations_session
    FOREIGN KEY (session_id) REFERENCES attendant_sessions (id) ON DELETE CASCADE,
  KEY idx_attendant_conversations_session (session_id),
  KEY idx_attendant_conversations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendant_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id CHAR(32) NOT NULL,
  role ENUM('visitor', 'attendant', 'system') NOT NULL,
  text_body MEDIUMTEXT NOT NULL,
  tool_name VARCHAR(64) NULL,
  tool_ok TINYINT(1) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendant_messages_conversation
    FOREIGN KEY (conversation_id) REFERENCES attendant_conversations (id) ON DELETE CASCADE,
  KEY idx_attendant_messages_conversation (conversation_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendant_pending_actions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id CHAR(32) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  tool_name VARCHAR(64) NOT NULL,
  payload_json JSON NOT NULL,
  summary_text VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendant_pending_conversation
    FOREIGN KEY (conversation_id) REFERENCES attendant_conversations (id) ON DELETE CASCADE,
  UNIQUE KEY uq_attendant_pending_token (token_hash),
  KEY idx_attendant_pending_conversation (conversation_id),
  KEY idx_attendant_pending_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendant_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id CHAR(32) NULL,
  session_id BIGINT UNSIGNED NULL,
  event_type VARCHAR(64) NOT NULL,
  page_id VARCHAR(64) NULL,
  section_id VARCHAR(80) NULL,
  intent_label VARCHAR(64) NULL,
  active_skills_json JSON NULL,
  retrieved_ids_json JSON NULL,
  tool_name VARCHAR(64) NULL,
  tool_ok TINYINT(1) NULL,
  latency_ms INT UNSIGNED NULL,
  prompt_tokens INT UNSIGNED NULL,
  completion_tokens INT UNSIGNED NULL,
  error_code VARCHAR(64) NULL,
  meta_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_attendant_events_conversation (conversation_id),
  KEY idx_attendant_events_type (event_type),
  KEY idx_attendant_events_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
