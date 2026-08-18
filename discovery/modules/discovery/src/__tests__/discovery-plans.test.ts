import {
  canRunAt,
  computeNextRunAt,
  computeSkipHoursNextRunAt,
  expandPlanTargets,
  isWithinActiveHours,
} from '../plans';

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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
