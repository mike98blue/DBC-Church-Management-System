import { boolean, index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { people } from './people.js';

export const directoryPreferences = pgTable(
  'directory_preferences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' })
      .unique(),
    showInDirectory: boolean('show_in_directory').notNull().default(false),
    showEmail: boolean('show_email').notNull().default(false),
    showPhone: boolean('show_phone').notNull().default(false),
    showAddress: boolean('show_address').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('directory_prefs_person_idx').on(table.personId)],
);
