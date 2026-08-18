CREATE TABLE IF NOT EXISTS "operator_saved_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "operator_id" varchar(100) NOT NULL,
  "surface" varchar(50) NOT NULL,
  "name" varchar(200) NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "definition" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "operator_saved_views_operator_surface_idx"
  ON "operator_saved_views" ("operator_id", "surface");
