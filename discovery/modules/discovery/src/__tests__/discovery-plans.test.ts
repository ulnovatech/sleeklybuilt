import {
  canRunAt,
  computeNextRunAt,
  computeSkipHoursNextRunAt,
  expandPlanTargets,
  isWithinActiveHours,
} from '../plans';
import {
  FACTORY_CADENCE,
  FACTORY_CORE_LIMITS,
  FACTORY_CORE_TEMPLATE_KEY,
  FACTORY_EXPLORE_LIMITS,
  FACTORY_FILTERS,
  FACTORY_MARKETS,
  FACTORY_PLACES_MONTHLY_FLOOR,
  FACTORY_TIMEZONE,
  buildFactoryTargets,
  countFactorySegments,
  marketsForTiers,
} from '../plans/factory-markets';
import { cohortDatesForHarvest, resolveMorningPath } from '../plans/harvest-cohort';
import { EXPLORE_FLOOR_EVERY, isExploreFloorSlot } from '../plans/explore-floor';
import { classifyWebsiteClass, keepOnMorningPath } from '../lib/website-class';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    passed++;
    console.log(`ok ${name}`);
  } else {
    failed++;
    console.error(`fail ${name}`);
  }
}

// --- expand targets ---
const segments = expandPlanTargets({
  countries: ['Uganda'],
  citiesByCountry: { Uganda: ['Kampala', 'Entebbe'] },
  industries: ['Restaurant', 'Clinic'],
});
assert(segments.length === 4, 'expands country × city × industry');
assert(
  segments.some((s) => s.city === 'Kampala' && s.industry === 'Clinic'),
  'includes Kampala Clinic',
);

const allCities = expandPlanTargets({
  countries: ['Kenya'],
  citiesByCountry: {},
  industries: ['Salon'],
}, 'All cities');
assert(allCities.length === 1 && allCities[0]?.city === 'All cities', 'empty cities → All cities');

const deduped = expandPlanTargets({
  countries: ['Uganda', 'Uganda'],
  citiesByCountry: { Uganda: ['Kampala', 'kampala'] },
  industries: ['Restaurant', 'restaurant'],
});
assert(deduped.length === 1, 'dedupes case-insensitive segments');

// --- cadence ---
const base = new Date('2026-08-07T12:00:00.000Z');
const next = computeNextRunAt(base, { everyHours: 6 });
assert(next.getTime() === base.getTime() + 6 * 3600_000, 'next run = now + everyHours');

assert(
  isWithinActiveHours(new Date('2026-08-07T10:00:00.000Z'), {
    everyHours: 24,
    activeHours: { start: 8, end: 18, timezone: 'UTC' },
  }),
  '10:00 UTC inside 8–18',
);

assert(
  !isWithinActiveHours(new Date('2026-08-07T20:00:00.000Z'), {
    everyHours: 24,
    activeHours: { start: 8, end: 18, timezone: 'UTC' },
  }),
  '20:00 UTC outside 8–18',
);

assert(
  !canRunAt(new Date('2026-08-07T12:00:00.000Z'), {
    everyHours: 24,
    daysOfWeek: [1], // Monday only; 2026-08-07 is Friday
    activeHours: { start: 0, end: 23, timezone: 'UTC' },
  }),
  'blocks disallowed weekday',
);

const skipNext = computeSkipHoursNextRunAt(
  new Date('2026-08-07T20:00:00.000Z'),
  { everyHours: 24, activeHours: { start: 8, end: 18, timezone: 'UTC' } },
);
assert(skipNext.getTime() > Date.parse('2026-08-07T20:00:00.000Z'), 'skip-hours advances forward');

// --- factory markets (F0) ---
assert(FACTORY_TIMEZONE === 'Africa/Nairobi', 'factory timezone is EAT');
assert(FACTORY_PLACES_MONTHLY_FLOOR === 600, 'Places monthly floor is 600');
assert(FACTORY_CADENCE.everyHours === 2, 'factory cadence every 2 hours');
assert(FACTORY_CADENCE.activeHours?.start === 7 && FACTORY_CADENCE.activeHours?.end === 22, 'EAT 07–22 window');
assert(
  JSON.stringify(FACTORY_CADENCE.daysOfWeek) === JSON.stringify([1, 2, 3, 4, 5]),
  'weekdays only',
);
assert(FACTORY_FILTERS.presence === 'greenfield', 'factory is greenfield');
assert(FACTORY_FILTERS.requirePhone === true, 'factory requires phone');
assert(FACTORY_FILTERS.socialSearch === 'tiktok', 'factory social overlay is TikTok-only');
assert(FACTORY_CORE_LIMITS.maxRunsPerDay === 12, 'core 12 runs/day');
assert(FACTORY_EXPLORE_LIMITS.maxRunsPerDay === 2, 'explore 2 runs/day');

const coreMarkets = marketsForTiers(['core']);
assert(
  coreMarkets.map((m) => m.country).join(',') === 'Uganda,Kenya,Nigeria',
  'core markets UG KE NG',
);
assert(
  !coreMarkets.some((m) => m.cities.length === 0),
  'core cities named (no All cities)',
);

const exploreMarkets = marketsForTiers(['explore', 'probe']);
assert(
  exploreMarkets.some((m) => m.country === 'Ghana') &&
    exploreMarkets.some((m) => m.country === 'United States' && m.cities.includes('Houston')),
  'explore includes Ghana and Houston probe',
);

const factoryIndustries = ['Restaurant', 'Salon & Spa'];
const coreTargets = buildFactoryTargets(coreMarkets, factoryIndustries);
assert(!coreTargets.countries.includes('Ghana'), 'core targets exclude Ghana');
assert(coreTargets.citiesByCountry.Uganda?.includes('Kampala'), 'Kampala in core Uganda');
assert(
  countFactorySegments(coreTargets) ===
    coreMarkets.reduce((n, m) => n + m.cities.length, 0) * factoryIndustries.length,
  'core segment count = cities × industries',
);

const exploreTargets = buildFactoryTargets(exploreMarkets, factoryIndustries);
assert(exploreTargets.countries.includes('Philippines'), 'explore includes Philippines');
assert(
  FACTORY_MARKETS.every((m) => m.cities.every((c) => c.toLowerCase() !== 'all cities')),
  'catalogue never uses All cities',
);

// --- F1 harvest hygiene ---
assert(classifyWebsiteClass(undefined) === 'none', 'no website is none');
assert(classifyWebsiteClass('https://linktr.ee/shop') === 'link_in_bio', 'link-in-bio class');
assert(classifyWebsiteClass('https://joekitchen.example') === 'real', 'owned site is real');
assert(keepOnMorningPath({ website: undefined }), 'morning path keeps no website');
assert(keepOnMorningPath({ website: 'https://linktr.ee/shop' }), 'morning path keeps link-in-bio');
assert(
  !keepOnMorningPath({ website: 'https://joekitchen.example', metadata: { websiteClass: 'real' } }),
  'morning path drops owned website',
);

assert(isExploreFloorSlot(0), 'first tick is explore');
assert(!isExploreFloorSlot(1), 'second tick is exploit');
assert(isExploreFloorSlot(EXPLORE_FLOOR_EVERY), 'every 8th tick is explore');
assert(!isExploreFloorSlot(EXPLORE_FLOOR_EVERY + 1), 'slot after explore is exploit');

const eatMorning = new Date('2026-08-18T04:00:00.000Z'); // 07:00 EAT Tuesday
const cohort = cohortDatesForHarvest(eatMorning, FACTORY_TIMEZONE);
assert(cohort.harvestDate === '2026-08-18', 'Tuesday 07:00 EAT harvestDate is Tuesday');
assert(cohort.sellDate === '2026-08-19', 'Tuesday harvest sells Wednesday');

const factoryMorning = resolveMorningPath({
  templateKey: FACTORY_CORE_TEMPLATE_KEY,
  planType: 'discovery',
  filters: FACTORY_FILTERS,
  sources: ['google_maps'],
});
assert(factoryMorning.dropRealWebsites, 'factory morning path drops real websites');
assert(factoryMorning.socialSearch === 'tiktok', 'factory social policy is tiktok');
assert(factoryMorning.sources?.join(',') === 'google_maps', 'factory sources stay Places-only');

const monitorPath = resolveMorningPath({
  templateKey: FACTORY_CORE_TEMPLATE_KEY,
  planType: 'monitor',
  filters: FACTORY_FILTERS,
  sources: ['google_maps'],
});
assert(!monitorPath.dropRealWebsites, 'monitor plans do not drop real websites');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
