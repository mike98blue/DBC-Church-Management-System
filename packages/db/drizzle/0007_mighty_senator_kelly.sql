CREATE TYPE "public"."care_status" AS ENUM('open', 'in_progress', 'closed');--> statement-breakpoint
CREATE TYPE "public"."prayer_visibility" AS ENUM('public', 'private', 'pastoral_only');--> statement-breakpoint
CREATE TABLE "care_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "care_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"care_case_id" uuid NOT NULL,
	"author_id" text,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prayer_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"request" text NOT NULL,
	"visibility" "prayer_visibility" DEFAULT 'private' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "care_cases" ADD CONSTRAINT "care_cases_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_notes" ADD CONSTRAINT "care_notes_care_case_id_care_cases_id_fk" FOREIGN KEY ("care_case_id") REFERENCES "public"."care_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "care_person_idx" ON "care_cases" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "care_notes_case_idx" ON "care_notes" USING btree ("care_case_id");--> statement-breakpoint
CREATE INDEX "prayer_person_idx" ON "prayer_requests" USING btree ("person_id");