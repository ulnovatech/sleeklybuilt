-- C7: Live CRM bridge — outcomes + sync audit

CREATE TABLE IF NOT EXISTS "lead_outcomes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid,
  "lead_id" uuid,
  "sleekly_dash_company_id" integer NOT NULL,
  "discovery_account_id" varchar(64),
  "outcome_status" varchar(20) NOT NULL,
  "project_value_ugx" integer,
  "services_sold" jsonb,
  "loss_reason" text,
  "closed_at" timestamp with time zone,
  "raw" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "lead_outcomes_sleekly_dash_company_id_unique" UNIQUE("sleekly_dash_company_id")
);

DO $$ BEGIN
  ALTER TABLE "lead_outcomes" ADD CONSTRAINT "lead_outcomes_account_id_accounts_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "lead_outcomes" ADD CONSTRAINT "lead_outcomes_lead_id_leads_id_fk"
    FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "lead_outcomes_account_id_idx" ON "lead_outcomes" ("account_id");
CREATE INDEX IF NOT EXISTS "lead_outcomes_discovery_account_id_idx" ON "lead_outcomes" ("discovery_account_id");
CREATE INDEX IF NOT EXISTS "lead_outcomes_closed_at_idx" ON "lead_outcomes" ("closed_at");

CREATE TABLE IF NOT EXISTS "crm_bridge_sync" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "direction" varchar(40) NOT NULL,
  "account_id" uuid,
  "lead_id" uuid,
  "external_key" varchar(120) NOT NULL,
  "status" varchar(20) NOT NULL,
  "payload" jsonb,
  "error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "crm_bridge_sync" ADD CONSTRAINT "crm_bridge_sync_account_id_accounts_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "crm_bridge_sync" ADD CONSTRAINT "crm_bridge_sync_lead_id_leads_id_fk"
    FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "crm_bridge_sync_direction_external_idx"
  ON "crm_bridge_sync" ("direction", "external_key");
CREATE INDEX IF NOT EXISTS "crm_bridge_sync_lead_id_idx" ON "crm_bridge_sync" ("lead_id");
