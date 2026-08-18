-- F1 harvest hygiene: cohort dates so Tuesday harvest cannot sell Tuesday;
-- drop_real_websites marks morning-path runs that skip owned websites at ingest.

ALTER TABLE "discovery_runs" ADD COLUMN IF NOT EXISTS "harvest_date" date;
ALTER TABLE "discovery_runs" ADD COLUMN IF NOT EXISTS "sell_date" date;
ALTER TABLE "discovery_runs" ADD COLUMN IF NOT EXISTS "drop_real_websites" boolean NOT NULL DEFAULT false;

ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "harvest_date" date;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "sell_date" date;

CREATE INDEX IF NOT EXISTS "discovery_runs_sell_date_idx" ON "discovery_runs" ("sell_date");
CREATE INDEX IF NOT EXISTS "accounts_sell_date_idx" ON "accounts" ("sell_date");
CREATE INDEX IF NOT EXISTS "discovery_runs_harvest_date_idx" ON "discovery_runs" ("harvest_date");
