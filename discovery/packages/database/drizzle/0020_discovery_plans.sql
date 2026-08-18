-- C1: Discovery Plans scheduler foundation

ALTER TABLE "discovery_runs"
  ADD COLUMN IF NOT EXISTS "plan_id" uuid,
  ADD COLUMN IF NOT EXISTS "plan_target_id" uuid,
  ADD COLUMN IF NOT EXISTS "trigger" varchar(20) DEFAULT 'manual' NOT NULL;

CREATE TABLE IF NOT EXISTS "discovery_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(200) NOT NULL,
  "description" text,
  "plan_type" varchar(20) DEFAULT 'discovery' NOT NULL,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "targets" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "run_profile" varchar(20) DEFAULT 'standard' NOT NULL,
  "prospect_focus" boolean DEFAULT false NOT NULL,
  "boi_narrative" boolean DEFAULT false NOT NULL,
  "campaign_key" varchar(80),
  "template_key" varchar(80),
  "cadence" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "limits" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "next_run_at" timestamp with time zone,
  "last_run_at" timestamp with time zone,
  "paused_reason" text,
  "consecutive_failures" integer DEFAULT 0 NOT NULL,
  "created_by" varchar(100),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "discovery_plans_status_next_run_idx"
  ON "discovery_plans" ("status", "next_run_at");

CREATE TABLE IF NOT EXISTS "discovery_plan_targets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL REFERENCES "discovery_plans"("id") ON DELETE CASCADE,
  "country" varchar(100) NOT NULL,
  "city" varchar(100) NOT NULL,
  "industry" varchar(200) NOT NULL,
  "last_run_at" timestamp with time zone,
  "last_run_id" uuid REFERENCES "discovery_runs"("id") ON DELETE SET NULL,
  "run_count" integer DEFAULT 0 NOT NULL,
  "last_yield" jsonb,
  "yield_score" real DEFAULT 0 NOT NULL,
  "won_count" integer DEFAULT 0 NOT NULL,
  "lost_count" integer DEFAULT 0 NOT NULL,
  "suppressed_until" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "discovery_plan_targets_plan_segment_uidx"
  ON "discovery_plan_targets" ("plan_id", "country", "city", "industry");

CREATE INDEX IF NOT EXISTS "discovery_plan_targets_plan_yield_idx"
  ON "discovery_plan_targets" ("plan_id", "yield_score" DESC, "last_run_at" ASC NULLS FIRST);

CREATE TABLE IF NOT EXISTS "discovery_plan_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL REFERENCES "discovery_plans"("id") ON DELETE CASCADE,
  "type" varchar(40) NOT NULL,
  "message" text,
  "run_id" uuid REFERENCES "discovery_runs"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "discovery_plan_events_plan_created_idx"
  ON "discovery_plan_events" ("plan_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "discovery_runs_plan_id_idx"
  ON "discovery_runs" ("plan_id");
