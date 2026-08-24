/**
 * ChurchOS canonical schema — People and Households (9.2), RBAC/audit (9.1/10.2),
 * plus Events (9.4). Additive migrations only. Never edit an applied migration.
 */
import { auditEvents } from './audit.js';
import { householdRoleEnum, personStatusEnum } from './enums.js';
import { eventAttendance, eventRegistrations, events, eventVisibilityEnum } from './events.js';
import { households, householdMembers } from './households.js';
import { people } from './people.js';
import { permissions, rolePermissions, roles } from './roles.js';

export {
  auditEvents,
  eventAttendance,
  eventRegistrations,
  events,
  eventVisibilityEnum,
  householdRoleEnum,
  households,
  householdMembers,
  people,
  permissions,
  personStatusEnum,
  rolePermissions,
  roles,
};
