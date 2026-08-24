CREATE TABLE "checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_person_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"room_id" uuid,
	"pickup_code" text NOT NULL,
	"status" text DEFAULT 'checked_in' NOT NULL,
	"checked_in_by" text,
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"checked_out_at" timestamp with time zone,
	"checked_out_by" text
);
--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_child_person_id_people_id_fk" FOREIGN KEY ("child_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checkins_child_idx" ON "checkins" USING btree ("child_person_id");--> statement-breakpoint
CREATE INDEX "checkins_event_idx" ON "checkins" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "checkins_pickup_idx" ON "checkins" USING btree ("pickup_code");