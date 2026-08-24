import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { assertPermission, hasPermission, PERMISSIONS, type Actor } from './index';

const reader: Actor = { id: 'user-1', permissions: [PERMISSIONS.PEOPLE_READ] };
const writer: Actor = {
  id: 'user-2',
  permissions: [PERMISSIONS.PEOPLE_READ, PERMISSIONS.PEOPLE_WRITE],
};

describe('hasPermission', () => {
  it('returns false for null actor', () => {
    expect(hasPermission(null, PERMISSIONS.PEOPLE_READ)).toBe(false);
  });

  it('returns false when permission is missing', () => {
    expect(hasPermission(reader, PERMISSIONS.PEOPLE_WRITE)).toBe(false);
  });

  it('returns true when permission is present', () => {
    expect(hasPermission(writer, PERMISSIONS.PEOPLE_WRITE)).toBe(true);
  });
});

describe('assertPermission', () => {
  it('throws ForbiddenException when permission is missing', () => {
    expect(() => assertPermission(reader, PERMISSIONS.PEOPLE_WRITE)).toThrow(ForbiddenException);
  });

  it('does not throw when permission is present', () => {
    expect(() => assertPermission(writer, PERMISSIONS.PEOPLE_WRITE)).not.toThrow();
  });
});
