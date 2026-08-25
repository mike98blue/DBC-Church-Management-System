/**
 * ChurchOS canonical schema — People/Households (9.2), RBAC/audit (9.1/10.2),
 * Events (9.4), Forms (9.5), Groups (9.3), Communications (9.7), Giving (9.6), Care (9.9), Scheduling (Phase 2), Facility + Worship + Check-in (Phase 3). Additive.
 */
import { auditEvents } from './audit.js';
import { backgroundCheckStatusEnum, backgroundChecks } from './background-checks.js';
import {
  careCases,
  careNotes,
  careStatusEnum,
  prayerRequests,
  prayerVisibilityEnum,
} from './care.js';
import { checkins } from './checkin.js';
import {
  communicationPreferences,
  messageRecipients,
  messages,
  templates,
} from './communications.js';
import { customFieldDefinitions, customFieldValues, customFieldTypeEnum } from './custom-fields.js';
import { householdRoleEnum, personStatusEnum } from './enums.js';
import { eventAttendance, eventRegistrations, events, eventVisibilityEnum } from './events.js';
import { facilities, reservations, resources, rooms } from './facility.js';
import { formAnswers, formFields, formSubmissions, formVersions, forms } from './forms.js';
import {
  contributionAllocations,
  contributions,
  donors,
  funds,
  paymentProviderTransactions,
} from './giving.js';
import { groupMembers, groups, groupTypeEnum, groupVisibilityEnum } from './groups.js';
import { households, householdMembers } from './households.js';
import { people } from './people.js';
import { permissions, rolePermissions, roles } from './roles.js';
import {
  availabilityStatusEnum,
  volunteerAssignments,
  volunteerAvailability,
} from './scheduling.js';
import { personTags, tags } from './tags.js';
import { userPersonLinks, users } from './users.js';
import { serviceItems, services, songs } from './worship.js';

export {
  auditEvents,
  availabilityStatusEnum,
  backgroundCheckStatusEnum,
  backgroundChecks,
  careCases,
  careNotes,
  careStatusEnum,
  checkins,
  communicationPreferences,
  contributionAllocations,
  contributions,
  customFieldDefinitions,
  customFieldValues,
  customFieldTypeEnum,
  donors,
  eventAttendance,
  eventRegistrations,
  events,
  eventVisibilityEnum,
  facilities,
  formAnswers,
  formFields,
  formSubmissions,
  formVersions,
  forms,
  funds,
  groupMembers,
  groups,
  groupTypeEnum,
  groupVisibilityEnum,
  householdRoleEnum,
  households,
  householdMembers,
  messages,
  messageRecipients,
  paymentProviderTransactions,
  people,
  permissions,
  personStatusEnum,
  prayerRequests,
  prayerVisibilityEnum,
  reservations,
  resources,
  rolePermissions,
  roles,
  rooms,
  serviceItems,
  services,
  songs,
  tags,
  personTags,
  templates,
  userPersonLinks,
  users,
  volunteerAssignments,
  volunteerAvailability,
};
