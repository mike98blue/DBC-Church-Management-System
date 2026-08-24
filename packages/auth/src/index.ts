/**
 * Permission names per blueprint Section 10.2.
 * ChurchOS owns authorization; a managed OIDC provider owns authentication.
 * Never invent a permission without a blueprint or ADR entry.
 */
import { ForbiddenException } from '@nestjs/common';

export const PERMISSIONS = {
  PEOPLE_READ: 'people.read',
  PEOPLE_WRITE: 'people.write',
  PEOPLE_EXPORT: 'people.export',
  HOUSEHOLDS_READ: 'households.read',
  HOUSEHOLDS_WRITE: 'households.write',
  GROUPS_READ: 'groups.read',
  GROUPS_MANAGE: 'groups.manage',
  EVENTS_READ: 'events.read',
  EVENTS_MANAGE: 'events.manage',
  ATTENDANCE_RECORD: 'attendance.record',
  FORMS_MANAGE: 'forms.manage',
  FORMS_SUBMIT: 'forms.submit',
  AUDIT_READ: 'audit.read',
  ADMIN_USERS: 'admin.users',
  ADMIN_ROLES: 'admin.roles',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

/**
 * Scope narrows a permission. Blueprint supports:
 * organization | campus | ministry | group | self | household
 * For the MVP we enforce permission presence; scope checks land with
 * multi-campus/group-scoped reads (Epic B/C).
 */
export type Scope = 'organization' | 'campus' | 'ministry' | 'group' | 'self' | 'household';

export interface Actor {
  id: string;
  permissions: Permission[];
  scopes?: Record<Permission, Scope[]>;
}

export function hasPermission(actor: Actor | null, permission: Permission): boolean {
  if (!actor) return false;
  return actor.permissions.includes(permission);
}

export function assertPermission(actor: Actor | null, permission: Permission): void {
  if (!hasPermission(actor, permission)) {
    throw new ForbiddenException(`Forbidden: missing ${permission}`);
  }
}
