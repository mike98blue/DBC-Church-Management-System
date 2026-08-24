import { index, pgEnum, pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { people } from './people.js';

export const groupVisibilityEnum = pgEnum('group_visibility', ['public', 'private', 'hidden']);
export const groupTypeEnum = pgEnum('group_type', [
  'small_group',
  'bible_study',
  'ministry_team',
  'class',
  'volunteer_team',
  'care_team',
  'other',
]);

export const groups = pgTable(
  'groups',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    type: groupTypeEnum('type').notNull().default('other'),
    visibility: groupVisibilityEnum('visibility').notNull().default('private'),
    capacity: integer('capacity'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('groups_name_idx').on(table.name)],
);

export const groupMembers = pgTable(
  'group_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'restrict' }),
    role: text('role').notNull().default('member'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('group_members_group_idx').on(table.groupId),
    index('group_members_person_idx').on(table.personId),
  ],
);

export type GroupRow = typeof groups.$inferSelect;
export type GroupMemberRow = typeof groupMembers.$inferSelect;
