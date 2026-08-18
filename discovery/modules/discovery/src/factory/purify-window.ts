import { hourInTimezone } from '../plans/cadence';
import { addIsoDateDays, calendarDateInTimezone } from '../plans/harvest-cohort';
import { FACTORY_TIMEZONE } from '../plans/factory-markets';

export type PurifyTargetDates = {
  harvestDate: string;
  sellDate: string;
  /** Night window 22:00–07:00 EAT when the worker should purify. */
  inWindow: boolean;
};

/**
 * After harvest day ends (22:00 EAT), purify that day's cohort for tomorrow's sell date.
 * Before 07:00 EAT, purify yesterday's harvest for today's freeze.
 */
export function purifyTargetDates(now = new Date(), timezone = FACTORY_TIMEZONE): PurifyTargetDates {
  const hour = hourInTimezone(now, timezone);
  const today = calendarDateInTimezone(now, timezone);
  if (hour >= 22) {
    return { harvestDate: today, sellDate: addIsoDateDays(today, 1), inWindow: true };
  }
  if (hour < 7) {
    return { harvestDate: addIsoDateDays(today, -1), sellDate: today, inWindow: true };
  }
  return { harvestDate: addIsoDateDays(today, -1), sellDate: today, inWindow: false };
}
