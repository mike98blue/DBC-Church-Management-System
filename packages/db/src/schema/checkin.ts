import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { people } from './people.js';
import { events } from './events.js';
import { rooms } from './facility.js';

export const checkins = pgTable(
  'checkins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    childPersonId: uuid('child_person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'restrict' }),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'set null' }),
    pickupCode: text('pickup_code').notNull(),
    status: text('status').notNull().default('checked_in'),
    checkedInBy: text('checked_in_by'),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }).notNull().defaultNow(),
    checkedOutAt: timestamp('checked_out_at', { withTimezone: true }),
    checkedOutBy: text('checked_out_by'),
  },
  (table) => [
    index('checkins_child_idx').on(table.childPersonId),
    index('checkins_event_idx').on(table.eventId),
    index('checkins_pickup_idx').on(table.pickupCode),
  ],
);
