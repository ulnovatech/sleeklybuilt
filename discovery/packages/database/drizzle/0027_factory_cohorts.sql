-- Frozen morning list + dumpster remainder for the Greenfield Pitch Factory.

CREATE TABLE IF NOT EXISTS "factory_cohorts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "harvest_date" date NOT NULL,
  "sell_date" date NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'purifying',
  "keeper_count" integer NOT NULL DEFAULT 0,
  "dumpster_count" integer NOT NULL DEFAULT 0,
  "error_message" text,
  "fallback_cohort_id" uuid,
  "frozen_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "factory_cohorts_sell_date_uidx" ON "factory_cohorts" ("sell_date");

CREATE TABLE IF NOT EXISTS "factory_cohort_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cohort_id" uuid NOT NULL REFERENCES "factory_cohorts"("id") ON DELETE CASCADE,
  "account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE CASCADE,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "lead_id" uuid REFERENCES "leads"("id") ON DELETE SET NULL,
  "role" varchar(20) NOT NULL,
  "miss_reason" varchar(40),
  "rank" integer,
  "rank_score" integer,
  "recommended_channel" varchar(20),
  "case_file" jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "factory_cohort_members_cohort_account_uidx"
  ON "factory_cohort_members" ("cohort_id", "account_id");
CREATE INDEX IF NOT EXISTS "factory_cohort_members_role_idx" ON "factory_cohort_members" ("cohort_id", "role");
CREATE INDEX IF NOT EXISTS "factory_cohort_members_lead_idx" ON "factory_cohort_members" ("lead_id");
