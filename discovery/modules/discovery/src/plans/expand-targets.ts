import type { PlanSegment, PlanTargetsConfig } from './types';

/**
 * Expand plan target config into unique country × city × industry segments.
 * Empty cities for a country → single "All cities" segment (matches discovery run UX).
 */
export function expandPlanTargets(
  targets: PlanTargetsConfig,
  allCitiesLabel = 'All cities',
): PlanSegment[] {
  const segments: PlanSegment[] = [];
  const seen = new Set<string>();

  for (const country of targets.countries) {
    const cities = targets.citiesByCountry[country]?.filter(Boolean) ?? [];
    const cityList = cities.length > 0 ? cities : [allCitiesLabel];
    for (const city of cityList) {
      for (const industry of targets.industries) {
        const key = `${country.toLowerCase()}|${city.toLowerCase()}|${industry.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        segments.push({ country, city, industry });
      }
    }
  }

  return segments;
}
