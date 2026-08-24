/**
 * ChurchOS canonical schema — People and Households (blueprint Section 9.2)
 * plus RBAC and audit scaffolding (Sections 9.1, 10.2).
 *
 * Rules:
 * - One person, one record. Every module references people.id.
 * - Identity (login accounts) is intentionally NOT here; users link to
 *   people via user_person_links when Epic B lands.
 * - Additive migrations only. Never edit an applied migration.
 */
import { auditEvents } from './audit.js';
import { householdRoleEnum, personStatusEnum } from './enums.js';
import { households, householdMembers } from './households.js';
import { people } from './people.js';
import { permissions, rolePermissions, roles } from './roles.js';

export {
  auditEvents,
  householdRoleEnum,
  households,
  householdMembers,
  people,
  permissions,
  personStatusEnum,
  rolePermissions,
  roles,
};
