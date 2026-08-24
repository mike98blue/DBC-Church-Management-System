CREATE TABLE "form_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_version_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"type" text NOT NULL,
	"required" text DEFAULT 'false' NOT NULL,
	"options" jsonb,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"submitted_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"visibility" text DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_version_id_form_versions_id_fk" FOREIGN KEY ("form_version_id") REFERENCES "public"."form_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_version_id_form_versions_id_fk" FOREIGN KEY ("form_version_id") REFERENCES "public"."form_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "form_answers_submission_idx" ON "form_answers" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "form_fields_version_idx" ON "form_fields" USING btree ("form_version_id");--> statement-breakpoint
CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "form_versions_form_idx" ON "form_versions" USING btree ("form_id");