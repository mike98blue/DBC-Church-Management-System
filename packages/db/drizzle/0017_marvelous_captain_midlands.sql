CREATE TABLE "directory_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"show_in_directory" boolean DEFAULT false NOT NULL,
	"show_email" boolean DEFAULT false NOT NULL,
	"show_phone" boolean DEFAULT false NOT NULL,
	"show_address" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "directory_preferences_person_id_unique" UNIQUE("person_id")
);
--> statement-breakpoint
ALTER TABLE "directory_preferences" ADD CONSTRAINT "directory_preferences_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "directory_prefs_person_idx" ON "directory_preferences" USING btree ("person_id");