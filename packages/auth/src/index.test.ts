import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { assertPermission, hasPermission, PERMISSIONS, type Actor } from './index';

const peopleReader: Actor = { id: 'user-1', permissions: [PERMISSIONS.PEOPLE_READ] };
const peopleWriter: Actor = {
  id: 'user-2',
  permissions: [PERMISSIONS.PEOPLE_READ, PERMISSIONS.PEOPLE_WRITE],
};
const eventsReader: Actor = { id: 'user-3', permissions: [PERMISSIONS.EVENTS_READ] };
const eventsManager: Actor = {
  id: 'user-4',
  permissions: [PERMISSIONS.EVENTS_READ, PERMISSIONS.EVENTS_MANAGE],
};
const submitter: Actor = { id: 'u5', permissions: [PERMISSIONS.FORMS_SUBMIT] };
const formsManager: Actor = { id: 'u6', permissions: [PERMISSIONS.FORMS_MANAGE] };
const groupsReader: Actor = { id: 'u7', permissions: [PERMISSIONS.GROUPS_READ] };
const groupsManager: Actor = {
  id: 'u8',
  permissions: [PERMISSIONS.GROUPS_READ, PERMISSIONS.GROUPS_MANAGE],
};

describe('hasPermission', () => {
  it('returns false for null actor', () => {
    expect(hasPermission(null, PERMISSIONS.PEOPLE_READ)).toBe(false);
    expect(hasPermission(null, PERMISSIONS.EVENTS_MANAGE)).toBe(false);
    expect(hasPermission(null, PERMISSIONS.FORMS_MANAGE)).toBe(false);
    expect(hasPermission(null, PERMISSIONS.GROUPS_MANAGE)).toBe(false);
  });

  it('returns false when permission is missing', () => {
    expect(hasPermission(peopleReader, PERMISSIONS.PEOPLE_WRITE)).toBe(false);
    expect(hasPermission(eventsReader, PERMISSIONS.EVENTS_MANAGE)).toBe(false);
    expect(hasPermission(submitter, PERMISSIONS.FORMS_MANAGE)).toBe(false);
    expect(hasPermission(groupsReader, PERMISSIONS.GROUPS_MANAGE)).toBe(false);
  });

  it('returns true when permission is present', () => {
    expect(hasPermission(peopleWriter, PERMISSIONS.PEOPLE_WRITE)).toBe(true);
    expect(hasPermission(eventsManager, PERMISSIONS.EVENTS_MANAGE)).toBe(true);
    expect(hasPermission(formsManager, PERMISSIONS.FORMS_MANAGE)).toBe(true);
    expect(hasPermission(groupsManager, PERMISSIONS.GROUPS_MANAGE)).toBe(true);
  });
});

describe('assertPermission', () => {
  it('throws ForbiddenException when permission is missing', () => {
    expect(() => assertPermission(peopleReader, PERMISSIONS.PEOPLE_WRITE)).toThrow(
      ForbiddenException,
    );
    expect(() => assertPermission(eventsReader, PERMISSIONS.EVENTS_MANAGE)).toThrow(
      ForbiddenException,
    );
    expect(() => assertPermission(submitter, PERMISSIONS.FORMS_MANAGE)).toThrow(ForbiddenException);
    expect(() => assertPermission(groupsReader, PERMISSIONS.GROUPS_MANAGE)).toThrow(
      ForbiddenException,
    );
  });

  it('does not throw when permission is present', () => {
    expect(() => assertPermission(peopleWriter, PERMISSIONS.PEOPLE_WRITE)).not.toThrow();
    expect(() => assertPermission(eventsManager, PERMISSIONS.EVENTS_MANAGE)).not.toThrow();
    expect(() => assertPermission(formsManager, PERMISSIONS.FORMS_MANAGE)).not.toThrow();
    expect(() => assertPermission(groupsManager, PERMISSIONS.GROUPS_MANAGE)).not.toThrow();
  });
});
