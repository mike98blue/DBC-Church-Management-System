import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { people } from './people.js';

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const personTags = pgTable(
  'person_tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('person_tags_person_tag_key').on(table.personId, table.tagId),
    index('person_tags_tag_idx').on(table.tagId),
  ],
);
