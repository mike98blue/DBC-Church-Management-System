import { index, pgEnum, pgTable, text, timestamp, uuid, date } from 'drizzle-orm/pg-core';
import { people } from './people.js';
import { groups } from './groups.js';
import { events } from './events.js';

export const availabilityStatusEnum = pgEnum('availability_status', [
  'available',
  'unavailable',
  'maybe',
]);

export const volunteerAvailability = pgTable(
  'volunteer_availability',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    status: availabilityStatusEnum('status').notNull().default('available'),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('availability_person_date_idx').on(table.personId, table.date)],
);

export const volunteerAssignments = pgTable(
  'volunteer_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    groupId: uuid('group_id').references(() => groups.id, { onDelete: 'set null' }),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
    role: text('role'),
    scheduledFor: date('scheduled_for').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('assignments_person_idx').on(table.personId),
    index('assignments_date_idx').on(table.scheduledFor),
  ],
);
