import { pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * RBAC scaffolding (blueprint Sections 9.1, 10.2).
 * Permissions are named like `people.read`, `households.read`, `audit.read`.
 * Roles group permissions; role_permissions is the join.
 * user_roles and the users table will arrive with OIDC linking (Epic B).
 */
export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
});

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export type RoleRow = typeof roles.$inferSelect;
export type PermissionRow = typeof permissions.$inferSelect;
