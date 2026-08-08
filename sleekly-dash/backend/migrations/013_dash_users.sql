-- Dash account auth (replaces single env-hardcoded admin)
-- Apply: php sleekly-dash/backend/scripts/apply_dash_users_migration.php

CREATE TABLE IF NOT EXISTS dash_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  username VARCHAR(100) NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NULL,
  role ENUM('admin', 'member') NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dash_users_email (email),
  UNIQUE KEY uq_dash_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dash_password_resets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dash_password_resets_token (token_hash),
  KEY idx_dash_password_resets_user (user_id),
  CONSTRAINT fk_dash_password_resets_user
    FOREIGN KEY (user_id) REFERENCES dash_users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
