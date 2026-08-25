/**
 * Recurrence expansion (E-02). Pure functions, no DB access, fully unit-testable.
 * Rule format (JSON stored in events.recurrence_rule):
 *   { "freq": "daily", "interval": 1 }
 *   { "freq": "weekly", "interval": 1, "byDay": [0, 3] }   // 0=Sunday ... 6=Saturday
 *
 * Bounds: occurrences are >= windowStart, < windowEnd, and <= seriesEnd
 * (seriesEnd inclusive: the final scheduled occurrence happens at seriesEnd).
 */

export interface RecurrenceRule {
  freq: 'daily' | 'weekly';
  interval: number;
  byDay?: number[];
}

export function parseRecurrenceRule(raw: string | null): RecurrenceRule | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RecurrenceRule;
    if (parsed.freq !== 'daily' && parsed.freq !== 'weekly') return null;
    if (!Number.isInteger(parsed.interval) || parsed.interval < 1) return null;
    if (parsed.byDay !== undefined && !Array.isArray(parsed.byDay)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function expandRecurrence(
  rule: RecurrenceRule,
  seriesStart: Date,
  windowStart: Date,
  windowEnd: Date,
  seriesEnd?: Date | null,
): Date[] {
  const occurrences: Date[] = [];
  if (windowStart >= windowEnd) return occurrences;

  const start = new Date(seriesStart);
  const msPerDay = 24 * 60 * 60 * 1000;

  const withinBounds = (candidate: Date): boolean => {
    if (candidate >= windowEnd) return false;
    if (seriesEnd && candidate > seriesEnd) return false;
    return true;
  };

  if (rule.freq === 'daily') {
    let current = new Date(start);
    while (current < windowStart) {
      current = new Date(current.getTime() + rule.interval * msPerDay);
    }
    let guard = 0;
    while (withinBounds(current) && guard < 10000) {
      guard += 1;
      occurrences.push(new Date(current));
      current = new Date(current.getTime() + rule.interval * msPerDay);
    }
    return occurrences;
  }

  // weekly with byDay (default: the series start's weekday)
  const targetDays =
    rule.byDay && rule.byDay.length > 0 ? [...rule.byDay].sort((a, b) => a - b) : [start.getDay()];
  const msPerWeek = 7 * msPerDay;

  const seriesWeekStart = new Date(start);
  seriesWeekStart.setUTCHours(0, 0, 0, 0);

  let day = new Date(Math.max(windowStart.getTime(), start.getTime()));
  day.setUTCHours(start.getUTCHours(), start.getUTCMinutes(), start.getUTCSeconds(), 0);

  let guard = 0;
  while (day < windowEnd && guard < 1000) {
    guard += 1;
    const dayStart = new Date(day);
    dayStart.setUTCHours(0, 0, 0, 0);
    const weekIndex = Math.floor((dayStart.getTime() - seriesWeekStart.getTime()) / msPerWeek);
    const dow = day.getUTCDay();
    if (dow === start.getDay() || targetDays.includes(dow)) {
      if (
        targetDays.includes(dow) &&
        weekIndex % rule.interval === 0 &&
        day >= start &&
        withinBounds(day)
      ) {
        occurrences.push(new Date(day));
      }
    }
    day = new Date(day.getTime() + msPerDay);
  }

  return occurrences.sort((a, b) => a.getTime() - b.getTime());
}
