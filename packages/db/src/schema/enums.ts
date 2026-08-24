import { pgEnum } from 'drizzle-orm/pg-core';
import { HOUSEHOLD_ROLES, PERSON_STATUSES } from '@churchos/domain';

export const personStatusEnum = pgEnum('person_status', PERSON_STATUSES);

export const householdRoleEnum = pgEnum('household_role', HOUSEHOLD_ROLES);
