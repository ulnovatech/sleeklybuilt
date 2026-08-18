import { discoveryPlanFiltersSchema } from '@agency/validation';
import { FACTORY_CORE_TEMPLATE_KEY, FACTORY_EXPLORE_TEMPLATE_KEY, FACTORY_TIMEZONE } from './factory-markets';
import type { PlanSocialSearch } from './types';

/** Calendar date YYYY-MM-DD in a timezone (EAT for factory harvest). */
export function calendarDateInTimezone(now: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addIsoDateDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map((part) => Number(part));
  if (!year || !month || !day) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/**
 * Harvest today is not sell today. Night purify + 07:00 freeze use sellDate.
 */
export function cohortDatesForHarvest(
  now = new Date(),
  timezone = FACTORY_TIMEZONE,
): { harvestDate: string; sellDate: string } {
  const harvestDate = calendarDateInTimezone(now, timezone);
  return { harvestDate, sellDate: addIsoDateDays(harvestDate, 1) };
}

export function isFactoryTemplateKey(templateKey?: string | null): boolean {
  return templateKey === FACTORY_CORE_TEMPLATE_KEY || templateKey === FACTORY_EXPLORE_TEMPLATE_KEY;
}

export function resolveMorningPath(plan: {
  templateKey?: string | null;
  planType?: string | null;
  filters?: unknown;
  sources?: unknown;
}): {
  dropRealWebsites: boolean;
  socialSearch: PlanSocialSearch;
  sources?: string[];
} {
  const sources = Array.isArray(plan.sources) ? plan.sources.map(String) : undefined;
  if (plan.planType === 'monitor') {
    return { dropRealWebsites: false, socialSearch: 'all', sources };
  }
  const parsed = discoveryPlanFiltersSchema.safeParse(plan.filters ?? {});
  const factory = isFactoryTemplateKey(plan.templateKey);
  const presence = parsed.success ? parsed.data.presence : 'greenfield';
  const socialSearch: PlanSocialSearch =
    parsed.success && parsed.data.socialSearch
      ? parsed.data.socialSearch
      : factory
        ? 'tiktok'
        : 'all';
  return {
    dropRealWebsites: factory || presence === 'greenfield',
    socialSearch,
    sources,
  };
}
