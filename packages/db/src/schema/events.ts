import { index, pgEnum, pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const eventVisibilityEnum = pgEnum('event_visibility', ['public', 'private']);

export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    visibility: eventVisibilityEnum('visibility').notNull().default('public'),
    capacity: integer('capacity'),
    location: text('location'),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    // E-02: JSON recurrence rule, e.g. {"freq":"weekly","interval":1,"byDay":[0]}
    recurrenceRule: text('recurrence_rule'),
    recurrenceEndsAt: timestamp('recurrence_ends_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('events_starts_at_idx').on(table.startsAt),
    index('events_visibility_idx').on(table.visibility),
  ],
);

export const eventRegistrations = pgTable(
  'event_registrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    personId: uuid('person_id'),
    guestName: text('guest_name'),
    guestEmail: text('guest_email'),
    status: text('status').notNull().default('registered'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('event_registrations_event_idx').on(table.eventId)],
);

export const eventAttendance = pgTable(
  'event_attendance',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    personId: uuid('person_id').notNull(),
    recordedBy: text('recorded_by'),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('event_attendance_event_idx').on(table.eventId),
    index('event_attendance_person_idx').on(table.personId),
  ],
);

export type EventRow = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventRegistrationRow = typeof eventRegistrations.$inferSelect;
export type EventAttendanceRow = typeof eventAttendance.$inferSelect;
