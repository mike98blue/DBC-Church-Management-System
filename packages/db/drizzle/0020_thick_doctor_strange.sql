CREATE TABLE "user_permission_scopes" (
	"user_id" uuid NOT NULL,
	"permission" text NOT NULL,
	"scope" text NOT NULL,
	CONSTRAINT "user_permission_scopes_user_id_permission_scope_pk" PRIMARY KEY("user_id","permission","scope")
);
--> statement-breakpoint
ALTER TABLE "user_permission_scopes" ADD CONSTRAINT "user_permission_scopes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;