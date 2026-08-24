import { index, jsonb, pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const forms = pgTable('forms', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  visibility: text('visibility').notNull().default('public'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const formVersions = pgTable(
  'form_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    formId: uuid('form_id')
      .notNull()
      .references(() => forms.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    status: text('status').notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('form_versions_form_idx').on(table.formId)],
);

export const formFields = pgTable(
  'form_fields',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    formVersionId: uuid('form_version_id')
      .notNull()
      .references(() => formVersions.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    label: text('label').notNull(),
    type: text('type').notNull(),
    required: text('required').notNull().default('false'),
    options: jsonb('options').$type<string[] | null>(),
    order: integer('order').notNull(),
  },
  (table) => [index('form_fields_version_idx').on(table.formVersionId)],
);

export const formSubmissions = pgTable(
  'form_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    formId: uuid('form_id')
      .notNull()
      .references(() => forms.id, { onDelete: 'cascade' }),
    formVersionId: uuid('form_version_id')
      .notNull()
      .references(() => formVersions.id, { onDelete: 'restrict' }),
    submittedBy: text('submitted_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('form_submissions_form_idx').on(table.formId)],
);

export const formAnswers = pgTable(
  'form_answers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => formSubmissions.id, { onDelete: 'cascade' }),
    fieldId: uuid('field_id')
      .notNull()
      .references(() => formFields.id, { onDelete: 'restrict' }),
    value: text('value'),
  },
  (table) => [index('form_answers_submission_idx').on(table.submissionId)],
);

export type FormRow = typeof forms.$inferSelect;
export type FormVersionRow = typeof formVersions.$inferSelect;
export type FormFieldRow = typeof formFields.$inferSelect;
export type FormSubmissionRow = typeof formSubmissions.$inferSelect;
