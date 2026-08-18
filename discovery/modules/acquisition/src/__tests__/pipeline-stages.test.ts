import { getPipelineStagesForRun } from '../pipeline-stages';

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

const standard = getPipelineStagesForRun('standard', false);
assert(!standard.includes('browser_enrich'), 'standard excludes browser_enrich');
assert(standard.length === 7, 'standard has seven stages');

const boostOff = getPipelineStagesForRun('boost', false);
assert(!boostOff.includes('browser_enrich'), 'boost without flag excludes browser');
assert(boostOff.length === 7, 'boost without browser has seven stages');

const boostOn = getPipelineStagesForRun('boost', true);
assert(boostOn.includes('browser_enrich'), 'boost with browser includes browser_enrich');
const scoreIdx = boostOn.indexOf('score');
const browserIdx = boostOn.indexOf('browser_enrich');
const placesIdx = boostOn.indexOf('places_enrich');
assert(scoreIdx >= 0 && browserIdx === scoreIdx + 1, 'browser_enrich after score');
assert(placesIdx === browserIdx + 1, 'places_enrich after browser_enrich');
assert(boostOn.length === 8, 'boost pipeline has eight stages with browser');

const monitor = getPipelineStagesForRun('standard', false, { planType: 'monitor' });
assert(
  monitor.join(',') === 'crawl,bi_enrich,derive_signals,score',
  'monitor pipeline is crawl → bi_enrich → derive_signals → score',
);
assert(!monitor.includes('discover'), 'monitor excludes discover');
assert(!monitor.includes('resolve_accounts'), 'monitor excludes resolve_accounts');
assert(!monitor.includes('browser_enrich'), 'monitor excludes browser_enrich');

const monitorIgnoresBoost = getPipelineStagesForRun('boost', true, { planType: 'monitor' });
assert(
  monitorIgnoresBoost.join(',') === monitor.join(','),
  'monitor planType overrides boost browser stages',
);

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
