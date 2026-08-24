import { describe, expect, it } from 'vitest';
import { displayName, legalName } from './index';

describe('displayName', () => {
  it('uses preferred name when set', () => {
    expect(
      displayName({ firstName: 'Alexander', preferredName: 'Alex', lastName: 'Example' }),
    ).toBe('Alex Example');
  });

  it('falls back to first name when preferred name is blank', () => {
    expect(displayName({ firstName: 'Jordan', preferredName: '   ', lastName: 'Example' })).toBe(
      'Jordan Example',
    );
  });

  it('uses first name when no preferred name', () => {
    expect(displayName({ firstName: 'Taylor', lastName: 'Example' })).toBe('Taylor Example');
  });
});

describe('legalName', () => {
  it('joins all name parts', () => {
    expect(legalName({ firstName: 'Morgan', middleName: 'Q', lastName: 'Example' })).toBe(
      'Morgan Q Example',
    );
  });

  it('omits missing middle name', () => {
    expect(legalName({ firstName: 'Morgan', lastName: 'Example' })).toBe('Morgan Example');
  });

  it('omits blank middle name', () => {
    expect(legalName({ firstName: 'Morgan', middleName: '  ', lastName: 'Example' })).toBe(
      'Morgan Example',
    );
  });
});
