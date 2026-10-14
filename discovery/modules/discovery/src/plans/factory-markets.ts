import type { PlanCadence, PlanFiltersConfig, PlanLimitsConfig, PlanTargetsConfig } from './types';

/** EAT — harvest window and 07:00 freeze timezone. */
export const FACTORY_TIMEZONE = 'Africa/Nairobi';

/** Floor so ~20 Places Text Search calls/day survive a month (named-city runs). */
export const FACTORY_PLACES_MONTHLY_FLOOR = 600;

export const FACTORY_CORE_TEMPLATE_KEY = 'factory_core';
export const FACTORY_EXPLORE_TEMPLATE_KEY = 'factory_explore';

export type FactoryMarketTier = 'core' | 'explore' | 'probe';

export type FactoryCountryMarkets = {
  country: string;
  cities: string[];
  tier: FactoryMarketTier;
};

/** Locked factory catalogue — named cities only, never All cities. */
export const FACTORY_MARKETS: FactoryCountryMarkets[] = [
  {
    tier: 'core',
    country: 'Uganda',
    cities: ['Kampala', 'Kira', 'Nansana', 'Mukono', 'Mbarara', 'Gulu'],
  },
  {
    tier: 'core',
    country: 'Kenya',
    cities: ['Nairobi', 'Mombasa', 'Nakuru', 'Kisumu', 'Eldoret'],
  },
  {
    tier: 'core',
    country: 'Nigeria',
    cities: ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Enugu', 'Benin City'],
  },
  {
    tier: 'explore',
    country: 'Ghana',
    cities: ['Accra', 'Kumasi', 'Tema'],
  },
  {
    tier: 'explore',
    country: 'Tanzania',
    cities: ['Dar Es Salaam', 'Arusha', 'Mwanza'],
  },
  {
    tier: 'explore',
    country: 'Philippines',
    cities: ['Quezon City', 'Manila', 'Cebu City', 'Davao'],
  },
  {
    tier: 'probe',
    country: 'United States',
    cities: ['Houston'],
  },
  {
    tier: 'probe',
    country: 'United Kingdom',
    cities: ['Birmingham'],
  },
];

export const FACTORY_CADENCE: PlanCadence = {
  everyHours: 2,
  activeHours: { start: 7, end: 22, timezone: FACTORY_TIMEZONE },
  daysOfWeek: [1, 2, 3, 4, 5],
};

/** True when factory plan cadence drifts from the locked every-2h weekday EAT window. */
export function factoryPlanNeedsCadenceHeal(cadence: unknown): boolean {
  if (!cadence || typeof cadence !== 'object') return true;
  const c = cadence as Record<string, unknown>;
  if (c.everyHours !== FACTORY_CADENCE.everyHours) return true;
  const days = Array.isArray(c.daysOfWeek) ? c.daysOfWeek.map(Number) : [];
  const expectedDays = FACTORY_CADENCE.daysOfWeek ?? [];
  if (days.length !== expectedDays.length || days.some((d, i) => d !== expectedDays[i])) {
    return true;
  }
  const hours = c.activeHours;
  if (!hours || typeof hours !== 'object') return true;
  const h = hours as Record<string, unknown>;
  const expected = FACTORY_CADENCE.activeHours!;
  return (
    h.start !== expected.start ||
    h.end !== expected.end ||
    h.timezone !== expected.timezone
  );
}

export const FACTORY_FILTERS: PlanFiltersConfig = {
  presence: 'greenfield',
  requirePhone: true,
  /**
   * Overlay when social_search is in sources.
   * Plan B factory ingest is YouTube-only (no TikTok / LinkedIn / X).
   */
  socialSearch: 'youtube',
};

export const FACTORY_CORE_LIMITS: PlanLimitsConfig = {
  maxRunsPerDay: 12,
  maxConcurrentRuns: 1,
};

export const FACTORY_EXPLORE_LIMITS: PlanLimitsConfig = {
  maxRunsPerDay: 2,
  maxConcurrentRuns: 1,
};

export function marketsForTiers(tiers: FactoryMarketTier[]): FactoryCountryMarkets[] {
  const wanted = new Set(tiers);
  return FACTORY_MARKETS.filter((m) => wanted.has(m.tier));
}

export function buildFactoryTargets(
  markets: FactoryCountryMarkets[],
  industries: string[],
): PlanTargetsConfig {
  const countries: string[] = [];
  const citiesByCountry: Record<string, string[]> = {};
  const seenCountry = new Set<string>();

  for (const market of markets) {
    if (!seenCountry.has(market.country)) {
      countries.push(market.country);
      seenCountry.add(market.country);
    }
    const existing = citiesByCountry[market.country] ?? [];
    const merged = [...existing];
    for (const city of market.cities) {
      if (!merged.some((c) => c.toLowerCase() === city.toLowerCase())) merged.push(city);
    }
    citiesByCountry[market.country] = merged;
  }

  return {
    countries,
    citiesByCountry,
    industries: [...industries],
  };
}

export function countFactorySegments(targets: PlanTargetsConfig): number {
  let n = 0;
  for (const country of targets.countries) {
    const cities = targets.citiesByCountry[country] ?? [];
    n += cities.length * targets.industries.length;
  }
  return n;
}
