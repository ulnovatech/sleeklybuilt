-- Queue claim indexes for acquisition job worker (pending + running reclaim).

CREATE INDEX IF NOT EXISTS "idx_acquisition_jobs_pending_created"
  ON "acquisition_jobs" ("created_at")
  WHERE "status" = 'pending';

CREATE INDEX IF NOT EXISTS "idx_acquisition_jobs_running_claimed"
  ON "acquisition_jobs" ("claimed_at")
  WHERE "status" = 'running';
