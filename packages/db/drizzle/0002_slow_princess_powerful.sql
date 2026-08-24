CREATE TYPE "public"."event_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "event_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"recorded_by" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"person_id" uuid,
	"guest_name" text,
	"guest_email" text,
	"status" text DEFAULT 'registered' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"visibility" "event_visibility" DEFAULT 'public' NOT NULL,
	"capacity" integer,
	"location" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_attendance_event_idx" ON "event_attendance" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_attendance_person_idx" ON "event_attendance" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "event_registrations_event_idx" ON "event_registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "events_visibility_idx" ON "events" USING btree ("visibility");