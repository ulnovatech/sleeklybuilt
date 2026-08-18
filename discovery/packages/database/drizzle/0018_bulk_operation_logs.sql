CREATE TABLE IF NOT EXISTS "bulk_operation_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "operator_id" varchar(100) NOT NULL,
  "surface" varchar(50) NOT NULL,
  "action" varchar(50) NOT NULL,
  "idempotency_key" varchar(100) NOT NULL UNIQUE,
  "selection_scope" varchar(30) DEFAULT 'explicit_ids' NOT NULL,
  "selection_query" jsonb,
  "requested_count" integer NOT NULL,
  "succeeded_count" integer DEFAULT 0 NOT NULL,
  "failed_count" integer DEFAULT 0 NOT NULL,
  "results" jsonb NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "bulk_operation_logs_operator_created_idx"
  ON "bulk_operation_logs" ("operator_id", "created_at" DESC);
