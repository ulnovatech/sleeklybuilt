import {
  countPitchedKeepers,
  demandJumpBlockReason,
  dumpsterReasonCoverage,
  greenfieldIntegrity,
  yieldHeadline,
} from '../factory/scoreboard';

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

const progress = countPitchedKeepers(['NEW', 'REVIEWED', 'CONTACTED', null, 'REPLIED']);
assert(progress.pitched === 2, 'CONTACTED and REPLIED count as recorded pitches');
assert(progress.unpitched === 3, 'NEW, REVIEWED, and missing lead stay unpitched');

const integrity = greenfieldIntegrity(100, 2);
assert(integrity.greenfieldPct === 98, 'greenfield pct excludes modernize leaks');
assert(greenfieldIntegrity(0, 0).greenfieldPct === null, 'empty list has no greenfield pct');

assert(dumpsterReasonCoverage(10, 0) === 100, 'every dumpster row with a reason is 100%');
assert(dumpsterReasonCoverage(0, 0) === null, 'empty dumpster has no coverage');

assert(
  yieldHeadline({
    city: 'Kampala',
    industry: 'Restaurant',
    yieldScore: 12,
    won: 3,
    lost: 1,
    emptyStreak: 0,
  }).includes('works'),
  'winning city type says it works',
);
assert(
  yieldHeadline({
    city: 'Houston',
    industry: 'Salon & Spa',
    yieldScore: 0,
    won: 0,
    lost: 0,
    emptyStreak: 3,
  }).includes('cooling off'),
  'empty streak cools the segment',
);

assert(
  demandJumpBlockReason({
    cohortStatus: 'purifying',
    phone: '+256700000000',
    website: null,
    metadata: { websiteClass: 'none' },
    suppressed: false,
    analysisHasWebsite: false,
  }) === 'cohort_not_frozen',
  'demand cannot jump an unfrozen harvest',
);

assert(
  demandJumpBlockReason({
    cohortStatus: 'frozen',
    phone: '+256700000000',
    website: null,
    metadata: { websiteClass: 'none' },
    suppressed: false,
    analysisHasWebsite: false,
    leadStatus: 'NEW',
  }) === null,
  'phone-ready greenfield with unpitched lead can jump',
);

assert(
  demandJumpBlockReason({
    cohortStatus: 'frozen',
    phone: null,
    website: null,
    metadata: { websiteClass: 'none' },
    suppressed: false,
    analysisHasWebsite: false,
  }) === 'no_phone',
  'no phone stays off Pitch today',
);

assert(
  demandJumpBlockReason({
    cohortStatus: 'frozen',
    phone: '+256700000000',
    website: 'https://example.com',
    metadata: { websiteClass: 'real' },
    suppressed: false,
    analysisHasWebsite: true,
  }) === 'has_website',
  'owned website does not mix into the 100',
);

assert(
  demandJumpBlockReason({
    cohortStatus: 'frozen',
    phone: '+256700000000',
    website: null,
    metadata: { websiteClass: 'none' },
    suppressed: false,
    analysisHasWebsite: false,
    leadStatus: 'CONTACTED',
  }) === 'already_pitched',
  'already contacted stays on Pipeline',
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
