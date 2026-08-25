import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { people } from './people.js';

/**
 * Provisioned login identities (blueprint §4.2: identity is separate from the
 * person record; §9.1). `externalSubject` is the OIDC `sub` claim from the
 * managed identity provider (ADR 0003). ChurchOS never stores passwords.
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    externalSubject: text('external_subject').notNull().unique(),
    email: text('email'),
    displayName: text('display_name'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('users_subject_idx').on(table.externalSubject)],
);

/**
 * Links a login identity to the canonical person record (B-02).
 * One user links to at most one person; a person may have at most one user.
 */
export const userPersonLinks = pgTable(
  'user_person_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'restrict' })
      .unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('user_person_links_person_idx').on(table.personId)],
);

export type UserRow = typeof users.$inferSelect;
