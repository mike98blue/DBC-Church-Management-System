CREATE TABLE "user_person_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_person_links_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_person_links_person_id_unique" UNIQUE("person_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_subject" text NOT NULL,
	"email" text,
	"display_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_external_subject_unique" UNIQUE("external_subject")
);
--> statement-breakpoint
ALTER TABLE "user_person_links" ADD CONSTRAINT "user_person_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_person_links" ADD CONSTRAINT "user_person_links_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_person_links_person_idx" ON "user_person_links" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "users_subject_idx" ON "users" USING btree ("external_subject");