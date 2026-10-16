CREATE TABLE "configurations" (
	"id" text PRIMARY KEY NOT NULL,
	"schema_version" integer NOT NULL,
	"version" integer NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
