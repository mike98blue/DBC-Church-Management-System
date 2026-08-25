import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { people } from './people.js';

export const backgroundCheckStatusEnum = pgEnum('background_check_status', [
  'not_started',
  'pending',
  'clear',
  'flagged',
  'expired',
]);

export const backgroundChecks = pgTable(
  'background_checks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('mock'),
    providerReferenceId: text('provider_reference_id'),
    status: backgroundCheckStatusEnum('status').notNull().default('not_started'),
    requestedBy: text('requested_by'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('background_checks_person_idx').on(table.personId)],
);
