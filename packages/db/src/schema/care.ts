import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { people } from './people.js';

export const prayerVisibilityEnum = pgEnum('prayer_visibility', ['public', 'private', 'pastoral_only']);
export const careStatusEnum = pgEnum('care_status', ['open', 'in_progress', 'closed']);

export const prayerRequests = pgTable(
  'prayer_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    request: text('request').notNull(),
    visibility: prayerVisibilityEnum('visibility').notNull().default('private'),
    status: text('status').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('prayer_person_idx').on(table.personId)]
);

export const careCases = pgTable(
  'care_cases',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    status: careStatusEnum('status').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('care_person_idx').on(table.personId)]
);

export const careNotes = pgTable(
  'care_notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    careCaseId: uuid('care_case_id')
      .notNull()
      .references(() => careCases.id, { onDelete: 'cascade' }),
    authorId: text('author_id'),
    note: text('note').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('care_notes_case_idx').on(table.careCaseId)]
);
