import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { personStatusEnum } from './enums.js';

export const people = pgTable(
  'people',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: text('first_name').notNull(),
    preferredName: text('preferred_name'),
    middleName: text('middle_name'),
    lastName: text('last_name').notNull(),
    status: personStatusEnum('status').notNull().default('guest'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('people_last_name_idx').on(table.lastName)],
);
