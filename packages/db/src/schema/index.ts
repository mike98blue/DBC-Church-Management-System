/**
 * ChurchOS canonical schema — People and Households (9.2), RBAC/audit (9.1/10.2),
 * plus Events (9.4) and Forms (9.5). Additive migrations only. Never edit an applied migration.
 */
import { auditEvents } from './audit.js';
import { householdRoleEnum, personStatusEnum } from './enums.js';
import { eventAttendance, eventRegistrations, events, eventVisibilityEnum } from './events.js';
import { formAnswers, formFields, formSubmissions, formVersions, forms } from './forms.js';
import { households, householdMembers } from './households.js';
import { people } from './people.js';
import { permissions, rolePermissions, roles } from './roles.js';

export {
  auditEvents,
  eventAttendance,
  eventRegistrations,
  events,
  eventVisibilityEnum,
  formAnswers,
  formFields,
  formSubmissions,
  formVersions,
  forms,
  householdRoleEnum,
  households,
  householdMembers,
  people,
  permissions,
  personStatusEnum,
  rolePermissions,
  roles,
};
