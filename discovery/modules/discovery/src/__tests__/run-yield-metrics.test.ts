import { classifyDiscoveryState } from '../lib/discovery-state';
import { countBySource } from '../run-yield-metrics';

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

const mixed = [
  { source: 'google_maps' },
  { source: 'public_search' },
  { source: 'google_maps' },
  { source: 'csv_import' },
];

assert(
  countBySource(mixed).google_maps === 2 &&
    countBySource(mixed).public_search === 1 &&
    countBySource(mixed).csv_import === 1,
  'aggregates counts per source',
);

assert(Object.keys(countBySource([])).length === 0, 'empty sources returns empty object');

const now = new Date('2026-08-07T12:00:00.000Z');

assert(
  classifyDiscoveryState({
    created: true,
    account: { updatedAt: now },
    staleAfterDays: 30,
    now,
  }) === 'new',
  'created account is new',
);

assert(
  classifyDiscoveryState({
    created: false,
    account: { lastCrawledAt: new Date('2026-08-01T12:00:00.000Z') },
    staleAfterDays: 30,
    now,
  }) === 'known_fresh',
  'recent crawl is known_fresh',
);

assert(
  classifyDiscoveryState({
    created: false,
    account: { lastCrawledAt: new Date('2026-06-01T12:00:00.000Z') },
    staleAfterDays: 30,
    now,
  }) === 'known_stale',
  'old crawl is known_stale',
);

assert(
  classifyDiscoveryState({
    created: false,
    account: { lastEnrichedAt: new Date('2026-08-05T12:00:00.000Z') },
    staleAfterDays: 30,
    now,
  }) === 'known_fresh',
  'uses lastEnrichedAt when no crawl',
);

assert(
  classifyDiscoveryState({
    created: false,
    account: {},
    staleAfterDays: 30,
    now,
  }) === 'known_stale',
  'missing anchors → known_stale',
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
