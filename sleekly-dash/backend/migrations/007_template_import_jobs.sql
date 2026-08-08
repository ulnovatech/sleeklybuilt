CREATE TABLE IF NOT EXISTS template_import_jobs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  status ENUM(
    'queued',
    'running',
    'scrubbing',
    'validating',
    'ready',
    'published',
    'rolled_back',
    'failed',
    'discarded'
  ) NOT NULL DEFAULT 'queued',
  source_url VARCHAR(2048) NOT NULL,
  slug VARCHAR(253) NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NOT NULL,
  staging_path VARCHAR(1024) NULL,
  report_json JSON NULL,
  error_message TEXT NULL,
  created_by VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  started_at DATETIME NULL,
  published_at DATETIME NULL,
  active_slug VARCHAR(253) GENERATED ALWAYS AS (
    CASE
      WHEN status IN ('queued', 'running', 'scrubbing', 'validating', 'ready') THEN slug
      ELSE NULL
    END
  ) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_template_import_jobs_active_slug (active_slug),
  KEY idx_template_import_jobs_status_created (status, created_at),
  KEY idx_template_import_jobs_slug_created (slug, created_at),
  KEY idx_template_import_jobs_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
