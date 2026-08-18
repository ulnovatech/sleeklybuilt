-- Rename CRM bridge company FK column after Sleekly Dash rebrand.
-- Safe on fresh installs that already used sleekly_dash_company_id in 0022.

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lead_outcomes'
      AND column_name = 'ulndash_company_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lead_outcomes'
      AND column_name = 'sleekly_dash_company_id'
  ) THEN
    ALTER TABLE "lead_outcomes" RENAME COLUMN "ulndash_company_id" TO "sleekly_dash_company_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lead_outcomes_ulndash_company_id_unique'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lead_outcomes_sleekly_dash_company_id_unique'
  ) THEN
    ALTER TABLE "lead_outcomes" RENAME CONSTRAINT "lead_outcomes_ulndash_company_id_unique"
      TO "lead_outcomes_sleekly_dash_company_id_unique";
  END IF;
END $$;
