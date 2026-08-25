import { describe, expect, it } from 'vitest';
import { expandRecurrence, parseRecurrenceRule } from './recurrence';

const MS_DAY = 24 * 60 * 60 * 1000;

describe('parseRecurrenceRule', () => {
  it('parses a valid weekly rule', () => {
    expect(parseRecurrenceRule('{"freq":"weekly","interval":1,"byDay":[0,3]}')).toEqual({
      freq: 'weekly',
      interval: 1,
      byDay: [0, 3],
    });
  });

  it('returns null for invalid JSON, bad freq, or bad interval', () => {
    expect(parseRecurrenceRule(null)).toBeNull();
    expect(parseRecurrenceRule('not json')).toBeNull();
    expect(parseRecurrenceRule('{"freq":"yearly","interval":1}')).toBeNull();
    expect(parseRecurrenceRule('{"freq":"daily","interval":0}')).toBeNull();
  });
});

describe('expandRecurrence — daily', () => {
  it('expands daily events within the window', () => {
    const seriesStart = new Date('2026-09-01T16:00:00Z');
    const windowStart = new Date('2026-09-07T00:00:00Z');
    const windowEnd = new Date('2026-09-10T00:00:00Z');
    const out = expandRecurrence(
      { freq: 'daily', interval: 1 },
      seriesStart,
      windowStart,
      windowEnd,
    );
    expect(out).toHaveLength(3);
    expect(out[0]?.toISOString()).toBe('2026-09-07T16:00:00.000Z');
    expect(out[2]?.toISOString()).toBe('2026-09-09T16:00:00.000Z');
  });

  it('honors interval (every 3 days)', () => {
    const seriesStart = new Date('2026-09-01T16:00:00Z');
    const out = expandRecurrence(
      { freq: 'daily', interval: 3 },
      seriesStart,
      new Date('2026-09-01T00:00:00Z'),
      new Date('2026-09-11T00:00:00Z'),
    );
    expect(out.map((d) => d.getUTCDate())).toEqual([1, 4, 7, 10]);
  });

  it('stops at seriesEnd when earlier than windowEnd', () => {
    const seriesStart = new Date('2026-09-01T16:00:00Z');
    const out = expandRecurrence(
      { freq: 'daily', interval: 1 },
      seriesStart,
      new Date('2026-09-01T00:00:00Z'),
      new Date('2026-09-30T00:00:00Z'),
      new Date('2026-09-03T16:00:00Z'),
    );
    expect(out).toHaveLength(3);
  });
});

describe('expandRecurrence — weekly', () => {
  it('expands weekly byDay (Sunday + Wednesday)', () => {
    const seriesStart = new Date('2026-09-06T16:00:00Z'); // Sunday
    const out = expandRecurrence(
      { freq: 'weekly', interval: 1, byDay: [0, 3] },
      seriesStart,
      new Date('2026-09-07T00:00:00Z'), // window Mon Sep 7 -> Mon Sep 21
      new Date('2026-09-21T00:00:00Z'),
    );
    const days = out.map((d) => d.getUTCDay());
    expect(days).toEqual([3, 0, 3, 0]); // Wed 9, Sun 13, Wed 16, Sun 20
    for (const d of out) expect(d.getUTCHours()).toBe(16);
  });

  it('honors interval weeks (every 2 weeks)', () => {
    const seriesStart = new Date('2026-09-06T16:00:00Z'); // Sunday Sep 6
    const out = expandRecurrence(
      { freq: 'weekly', interval: 2, byDay: [0] },
      seriesStart,
      new Date('2026-09-06T00:00:00Z'),
      new Date('2026-10-01T00:00:00Z'),
    );
    // Sundays: Sep 6, Sep 20 (skip Sep 13)
    expect(out.map((d) => d.toISOString().slice(0, 10))).toEqual(['2026-09-06', '2026-09-20']);
  });

  it('defaults byDay to the series start weekday', () => {
    const seriesStart = new Date('2026-09-08T16:00:00Z'); // Tuesday
    const out = expandRecurrence(
      { freq: 'weekly', interval: 1 },
      seriesStart,
      new Date('2026-09-07T00:00:00Z'),
      new Date('2026-09-22T00:00:00Z'),
    );
    expect(out.every((d) => d.getUTCDay() === 2)).toBe(true);
    expect(out.length).toBeGreaterThanOrEqual(2);
  });

  it('includes the series start itself when it falls in the window', () => {
    const seriesStart = new Date('2026-09-06T16:00:00Z');
    const out = expandRecurrence(
      { freq: 'weekly', interval: 1, byDay: [0] },
      seriesStart,
      new Date('2026-09-06T00:00:00Z'),
      new Date('2026-09-14T00:00:00Z'),
    );
    expect(out[0]?.toISOString()).toBe('2026-09-06T16:00:00.000Z');
  });

  it('returns empty when window is before series start', () => {
    const seriesStart = new Date('2026-10-01T16:00:00Z');
    const out = expandRecurrence(
      { freq: 'weekly', interval: 1, byDay: [4] },
      seriesStart,
      new Date('2026-09-01T00:00:00Z'),
      new Date('2026-09-30T00:00:00Z'),
    );
    expect(out).toHaveLength(0);
  });

  it('daily expansion respects ms-per-day arithmetic across DST-neutral UTC', () => {
    const seriesStart = new Date('2026-02-27T12:00:00Z');
    const out = expandRecurrence(
      { freq: 'daily', interval: 1 },
      seriesStart,
      new Date('2026-02-27T00:00:00Z'),
      new Date('2026-03-02T00:00:00Z'),
    );
    expect(out.map((d) => d.toISOString())).toEqual([
      '2026-02-27T12:00:00.000Z',
      '2026-02-28T12:00:00.000Z',
      '2026-03-01T12:00:00.000Z',
    ]);
    void MS_DAY;
  });
});
