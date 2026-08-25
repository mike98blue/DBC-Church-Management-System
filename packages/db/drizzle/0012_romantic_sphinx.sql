CREATE TYPE "public"."background_check_status" AS ENUM('not_started', 'pending', 'clear', 'flagged', 'expired');--> statement-breakpoint
CREATE TABLE "background_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"provider" text DEFAULT 'mock' NOT NULL,
	"provider_reference_id" text,
	"status" "background_check_status" DEFAULT 'not_started' NOT NULL,
	"requested_by" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "background_checks_person_idx" ON "background_checks" USING btree ("person_id");