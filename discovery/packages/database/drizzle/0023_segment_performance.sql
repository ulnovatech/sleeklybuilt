-- C8: Outcome learning — segment performance + outcome segment key

ALTER TABLE "lead_outcomes"
  ADD COLUMN IF NOT EXISTS "segment_key" varchar(240);

CREATE INDEX IF NOT EXISTS "lead_outcomes_segment_key_idx"
  ON "lead_outcomes" ("segment_key");

CREATE TABLE IF NOT EXISTS "segment_performance" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "segment_key" varchar(240) NOT NULL,
  "industry" varchar(200),
  "city" varchar(100),
  "presence_class" varchar(40),
  "primary_gap" varchar(80),
  "won_count" integer NOT NULL DEFAULT 0,
  "lost_count" integer NOT NULL DEFAULT 0,
  "sample_size" integer NOT NULL DEFAULT 0,
  "win_rate" real NOT NULL DEFAULT 0,
  "avg_project_value_ugx" real,
  "avg_days_to_close" real,
  "adjustment" integer NOT NULL DEFAULT 0,
  "label" text,
  "refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "segment_performance_segment_key_unique" UNIQUE("segment_key")
);

CREATE INDEX IF NOT EXISTS "segment_performance_sample_size_idx"
  ON "segment_performance" ("sample_size");
