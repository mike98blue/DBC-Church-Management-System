import { index, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { people } from './people.js';

export const customFieldTypeEnum = pgEnum('custom_field_type', [
  'text',
  'number',
  'date',
  'boolean',
  'select',
]);

/**
 * C-09: church-configurable person fields (blueprint §9.2). Definitions are
 * admin-managed; values reference people. Definitions are never hard-deleted
 * once values exist (values cascade with their person).
 */
export const customFieldDefinitions = pgTable('custom_field_definitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  type: customFieldTypeEnum('type').notNull().default('text'),
  options: text('options'), // comma-separated for select type
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const customFieldValues = pgTable(
  'custom_field_values',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    definitionId: uuid('definition_id')
      .notNull()
      .references(() => customFieldDefinitions.id, { onDelete: 'cascade' }),
    value: text('value'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('custom_field_values_person_def_key').on(table.personId, table.definitionId),
    index('custom_field_values_def_idx').on(table.definitionId),
  ],
);
