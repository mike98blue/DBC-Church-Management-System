CREATE UNIQUE INDEX "contributions_provider_tx_unique" ON "contributions" USING btree ("provider_transaction_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_registrations_event_person_unique" ON "event_registrations" USING btree ("event_id","person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "form_answers_submission_field_unique" ON "form_answers" USING btree ("submission_id","field_id");--> statement-breakpoint
CREATE UNIQUE INDEX "form_versions_form_version_unique" ON "form_versions" USING btree ("form_id","version");