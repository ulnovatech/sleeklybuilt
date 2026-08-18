-- C2: Incremental discovery state on per-run business rows

ALTER TABLE "businesses"
  ADD COLUMN IF NOT EXISTS "discovery_state" varchar(20);

CREATE INDEX IF NOT EXISTS "businesses_run_discovery_state_idx"
  ON "businesses" ("discovery_run_id", "discovery_state");
