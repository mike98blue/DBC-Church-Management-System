import { index, pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { people } from './people.js';

export const communicationPreferences = pgTable(
  'communication_preferences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' })
      .unique(),
    emailOptIn: boolean('email_opt_in').notNull().default(true),
    unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('comm_prefs_person_idx').on(table.personId)],
);

export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    templateId: uuid('template_id').references(() => templates.id, { onDelete: 'set null' }),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('messages_created_at_idx').on(table.createdAt)],
);

export const messageRecipients = pgTable(
  'message_recipients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('queued'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('msg_recipients_message_idx').on(table.messageId)],
);

export type CommunicationPreferenceRow = typeof communicationPreferences.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;
