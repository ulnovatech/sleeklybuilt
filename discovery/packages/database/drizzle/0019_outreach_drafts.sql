CREATE TABLE IF NOT EXISTS "outreach_drafts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
  "channel" varchar(30) NOT NULL,
  "subject" varchar(500),
  "body" text NOT NULL,
  "fact_pack_hash" varchar(64) NOT NULL,
  "fact_pack" jsonb NOT NULL,
  "provider" varchar(40) NOT NULL,
  "model" varchar(120) NOT NULL,
  "regenerated" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "outreach_drafts_lead_channel_uidx"
  ON "outreach_drafts" ("lead_id", "channel");

CREATE TABLE IF NOT EXISTS "draft_usage_daily" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "day" varchar(10) NOT NULL,
  "operator_id" varchar(100) DEFAULT 'system' NOT NULL,
  "used" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "draft_usage_daily_day_operator_uidx"
  ON "draft_usage_daily" ("day", "operator_id");
