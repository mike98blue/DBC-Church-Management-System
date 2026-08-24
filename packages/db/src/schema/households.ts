import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { householdRoleEnum } from './enums.js';
import { people } from './people.js';

export const households = pgTable('households', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const householdMembers = pgTable(
  'household_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    householdId: uuid('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'restrict' }),
    role: householdRoleEnum('role').notNull().default('other'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('household_members_household_person_key').on(table.householdId, table.personId),
    index('household_members_person_idx').on(table.personId),
  ],
);

export const householdRelations = relations(households, ({ many }) => ({
  members: many(householdMembers),
}));

export const householdMemberRelations = relations(householdMembers, ({ one }) => ({
  household: one(households, {
    fields: [householdMembers.householdId],
    references: [households.id],
  }),
  person: one(people, {
    fields: [householdMembers.personId],
    references: [people.id],
  }),
}));

// Re-export for convenience in queries.
export type HouseholdMemberRole = (typeof householdRoleEnum.enumValues)[number];
export type NewHousehold = typeof households.$inferInsert;
export type NewHouseholdMember = typeof householdMembers.$inferInsert;
export type NewPerson = typeof people.$inferInsert;
export type PersonRow = typeof people.$inferSelect;
export type HouseholdRow = typeof households.$inferSelect;
