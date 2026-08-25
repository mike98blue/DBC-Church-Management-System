ALTER TABLE "events" ADD COLUMN "recurrence_rule" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "recurrence_ends_at" timestamp with time zone;