import type { PlanCadence } from './types';

/** Hour of day in a timezone (0–23). Falls back to UTC on invalid timezone. */
export function hourInTimezone(date: Date, timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(date);
    const hour = parts.find((p) => p.type === 'hour')?.value;
    return hour != null ? Number(hour) : date.getUTCHours();
  } catch {
    return date.getUTCHours();
  }
}

/** Day of week in a timezone (0=Sun … 6=Sat). */
export function weekdayInTimezone(date: Date, timezone: string): number {
  try {
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
    }).format(date);
    const map: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return map[weekday] ?? date.getUTCDay();
  } catch {
    return date.getUTCDay();
  }
}

/**
 * Active-hours window. If start === end, window is always open.
 * If start < end: [start, end). If start > end: overnight wrap.
 */
export function isWithinActiveHours(now: Date, cadence: PlanCadence): boolean {
  const ah = cadence.activeHours;
  if (!ah) return true;
  if (ah.start === ah.end) return true;
  const hour = hourInTimezone(now, ah.timezone || 'UTC');
  if (ah.start < ah.end) return hour >= ah.start && hour < ah.end;
  return hour >= ah.start || hour < ah.end;
}

export function isAllowedDayOfWeek(now: Date, cadence: PlanCadence): boolean {
  const days = cadence.daysOfWeek;
  if (!days || days.length === 0) return true;
  const tz = cadence.activeHours?.timezone || 'UTC';
  return days.includes(weekdayInTimezone(now, tz));
}

export function canRunAt(now: Date, cadence: PlanCadence): boolean {
  return isAllowedDayOfWeek(now, cadence) && isWithinActiveHours(now, cadence);
}

/** Next instant at `hour:00` in timezone on or after `from` (UTC Date). */
export function nextClockAtHour(from: Date, hour: number, timezone: string): Date {
  // Search forward up to 48h in 15-minute steps — robust for DST without a tz lib.
  const stepMs = 15 * 60_000;
  for (let i = 0; i < 48 * 4; i++) {
    const candidate = new Date(from.getTime() + i * stepMs);
    if (hourInTimezone(candidate, timezone) === hour && candidate.getUTCMinutes() < 15) {
      // Snap to the 15-min bucket start
      const snapped = new Date(candidate);
      snapped.setUTCSeconds(0, 0);
      if (snapped.getTime() >= from.getTime()) return snapped;
    }
  }
  return new Date(from.getTime() + 60 * 60_000);
}

export function computeNextRunAt(from: Date, cadence: PlanCadence): Date {
  const everyMs = Math.max(1, cadence.everyHours) * 3600_000;
  let next = new Date(from.getTime() + everyMs);

  if (!cadence.activeHours && (!cadence.daysOfWeek || cadence.daysOfWeek.length === 0)) {
    return next;
  }

  // Advance until inside the allowed window (cap 14 days of steps).
  for (let i = 0; i < 14 * 24; i++) {
    if (canRunAt(next, cadence)) return next;
    next = new Date(next.getTime() + 3600_000);
  }
  return next;
}

/** When skipped for hours, bump to the next window open rather than everyHours later. */
export function computeSkipHoursNextRunAt(now: Date, cadence: PlanCadence): Date {
  const ah = cadence.activeHours;
  if (!ah) return computeNextRunAt(now, cadence);
  const tz = ah.timezone || 'UTC';
  let candidate = nextClockAtHour(now, ah.start, tz);
  for (let i = 0; i < 14; i++) {
    if (canRunAt(candidate, cadence)) return candidate;
    candidate = new Date(candidate.getTime() + 24 * 3600_000);
  }
  return computeNextRunAt(now, cadence);
}
