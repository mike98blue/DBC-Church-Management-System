/**
 * Canonical person record shared across every ChurchOS module.
 *
 * Rule: one person, one record (blueprint Section 4.1). Giving, attendance,
 * groups, and communications all reference this identity — never create
 * module-local person tables.
 */

export const PERSON_STATUSES = ['guest', 'attendee', 'member', 'inactive', 'staff'] as const;

export type PersonStatus = (typeof PERSON_STATUSES)[number];

export const HOUSEHOLD_ROLES = ['head', 'spouse', 'adult', 'child', 'other'] as const;

export type HouseholdRole = (typeof HOUSEHOLD_ROLES)[number];

export interface Person {
  id: string;
  firstName: string;
  preferredName?: string;
  middleName?: string;
  lastName: string;
  status: PersonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Household {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HouseholdMember {
  householdId: string;
  personId: string;
  role: HouseholdRole;
}

/** Preferred name if set, otherwise first name. */
export function displayName(
  person: Pick<Person, 'firstName' | 'preferredName' | 'lastName'>,
): string {
  const first = person.preferredName?.trim() || person.firstName;
  return `${first} ${person.lastName}`.trim();
}

/** Full legal-style name for records and statements. */
export function legalName(person: Pick<Person, 'firstName' | 'middleName' | 'lastName'>): string {
  return [person.firstName, person.middleName, person.lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');
}
