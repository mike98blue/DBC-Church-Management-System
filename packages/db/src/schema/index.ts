/**
 * ChurchOS canonical schema — People/Households (9.2), RBAC/audit (9.1/10.2),
 * Events (9.4), Forms (9.5), Groups (9.3), Communications (9.7). Additive.
 */
import { auditEvents } from './audit.js';
import {
  communicationPreferences,
  messageRecipients,
  messages,
  templates,
} from './communications.js';
import { householdRoleEnum, personStatusEnum } from './enums.js';
import { eventAttendance, eventRegistrations, events, eventVisibilityEnum } from './events.js';
import { formAnswers, formFields, formSubmissions, formVersions, forms } from './forms.js';
import { groupMembers, groups, groupTypeEnum, groupVisibilityEnum } from './groups.js';
import { households, householdMembers } from './households.js';
import { people } from './people.js';
import { permissions, rolePermissions, roles } from './roles.js';

export {
  auditEvents,
  communicationPreferences,
  eventAttendance,
  eventRegistrations,
  events,
  eventVisibilityEnum,
  formAnswers,
  formFields,
  formSubmissions,
  formVersions,
  forms,
  groupMembers,
  groups,
  groupTypeEnum,
  groupVisibilityEnum,
  householdRoleEnum,
  households,
  householdMembers,
  messages,
  messageRecipients,
  people,
  permissions,
  personStatusEnum,
  rolePermissions,
  roles,
  templates,
};
