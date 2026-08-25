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
  COMMUNICATIONS_SEND: 'communications.send',
  GIVING_READ: 'giving.read',
  GIVING_MANAGE: 'giving.manage',
  GIVING_EXPORT: 'giving.export',
  CARE_READ: 'care.read',
  CARE_WRITE: 'care.write',
  PRAYER_READ: 'prayer.read',
  SCHEDULING_MANAGE: 'scheduling.manage',
  AVAILABILITY_MANAGE: 'availability.manage',
  FACILITY_READ: 'facility.read',
  FACILITY_MANAGE: 'facility.manage',
  WORSHIP_READ: 'worship.read',
  WORSHIP_MANAGE: 'worship.manage',
  CHECKIN_OPERATE: 'checkin.operate',
  CHECKIN_ADMIN: 'checkin.admin',
  BACKGROUNDCHECK_READ: 'backgroundcheck.read',
  BACKGROUNDCHECK_MANAGE: 'backgroundcheck.manage',
  DIRECTORY_READ: 'directory.read',
  DIRECTORY_MANAGE: 'directory.manage',
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
  /** Canonical person record linked to this identity, if any (B-02). */
  personId?: string;
  /** Email claim from the identity token, when present. */
  email?: string;
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
