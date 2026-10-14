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
assert(standard.includes('website_discover'), 'standard includes website_discover');
assert(standard.includes('contact_enrich'), 'standard includes contact_enrich');
assert(standard.indexOf('website_discover') < standard.indexOf('contact_enrich'), 'website before contact');
assert(standard.indexOf('contact_enrich') < standard.indexOf('crawl'), 'contact before crawl');
assert(standard.length === 9, 'standard has nine stages');

const boostOff = getPipelineStagesForRun('boost', false);
assert(!boostOff.includes('browser_enrich'), 'boost without flag excludes browser');
assert(boostOff.length === 9, 'boost without browser has nine stages');

const boostOn = getPipelineStagesForRun('boost', true);
assert(boostOn.includes('browser_enrich'), 'boost with browser includes browser_enrich');
const scoreIdx = boostOn.indexOf('score');
const browserIdx = boostOn.indexOf('browser_enrich');
const placesIdx = boostOn.indexOf('places_enrich');
assert(scoreIdx >= 0 && browserIdx === scoreIdx + 1, 'browser_enrich after score');
assert(placesIdx === browserIdx + 1, 'places_enrich after browser_enrich');
assert(boostOn.length === 10, 'boost pipeline has ten stages with browser');

const monitor = getPipelineStagesForRun('standard', false, { planType: 'monitor' });
assert(
  monitor.join(',') ===
    'website_discover,contact_enrich,crawl,bi_enrich,derive_signals,score',
  'monitor pipeline includes website/contact before crawl',
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
