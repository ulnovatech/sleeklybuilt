CREATE TABLE IF NOT EXISTS template_import_audit_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_id BIGINT UNSIGNED NULL,
  action VARCHAR(50) NOT NULL,
  actor VARCHAR(100) NOT NULL,
  slug VARCHAR(253) NOT NULL,
  details_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_template_import_audit_job_created (job_id, created_at),
  KEY idx_template_import_audit_actor_created (actor, created_at),
  KEY idx_template_import_audit_slug_created (slug, created_at),
  KEY idx_template_import_audit_action_created (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
