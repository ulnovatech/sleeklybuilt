ALTER TABLE template_import_jobs
  MODIFY COLUMN status ENUM(
    'queued',
    'running',
    'scrubbing',
    'validating',
    'ready',
    'published',
    'rolled_back',
    'failed',
    'discarded'
  ) NOT NULL DEFAULT 'queued';
