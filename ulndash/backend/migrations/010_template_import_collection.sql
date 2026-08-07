-- Product-line collection for template imports (websites | sleek-pages).
-- Distinct from industry category (food, business, …).

ALTER TABLE template_import_jobs
  ADD COLUMN collection VARCHAR(32) NOT NULL DEFAULT 'websites'
    AFTER category,
  ADD KEY idx_template_import_jobs_collection (collection);
