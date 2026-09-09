CREATE TABLE "idempotency_keys" (
	"key" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"response" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
