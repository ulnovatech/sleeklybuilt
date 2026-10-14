import { classifyMissReason } from '../factory/miss-reasons';
import { purifyTargetDates } from '../factory/purify-window';
import { cutKeepers, geoTierForCountry, rankScore } from '../factory/rank';
import { hasWhatsAppHint, recommendPitchChannel } from '../factory/recommended-channel';

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

function confirmedMeta(extra: Record<string, unknown> = {}) {
  const now = new Date().toISOString();
  return {
    businessStatus: 'OPERATIONAL',
    websiteClass: 'none',
    greenfieldStatus: 'confirmed_greenfield',
    prospectProof: {
      version: 1,
      greenfieldStatus: 'confirmed_greenfield',
      websiteSearchCoverage: 1,
      searchCompletion: 'complete',
      websiteSearchAt: now,
      classificationReason: 'Adequate search — no owned site',
      queries: [
        {
          query: '"Cafe" "Kampala"',
          required: true,
          role: 'name_locality',
          outcome: 'empty',
        },
        {
          query: '"Cafe" Kampala, Uganda website OR official site',
          required: false,
          role: 'website_intent',
          outcome: 'empty',
        },
      ],
      websiteHits: [],
      contacts: [
        {
          channel: 'email',
          value: 'hello@cafe.test',
          source: 'public_search',
          observedAt: now,
          verified: true,
          identityMatch: 'likely',
        },
      ],
    },
    ...extra,
  };
}

assert(
  classifyMissReason({
    phone: '+256700000000',
    email: 'hello@cafe.test',
    website: null,
    metadata: confirmedMeta(),
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === null,
  'confirmed greenfield with phone+email is eligible',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    website: null,
    metadata: { businessStatus: 'OPERATIONAL', websiteClass: 'none' },
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === 'search_incomplete',
  'empty URL without completed search is search_incomplete',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    email: 'a@b.com',
    website: null,
    metadata: confirmedMeta(),
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
    snoozedUntil: new Date(Date.now() + 60_000),
  }) === 'snoozed',
  'active snooze is dumped as snoozed',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    email: 'a@b.com',
    website: null,
    metadata: confirmedMeta(),
    suppressed: true,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === 'suppressed',
  'suppressed beats other gates',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    email: 'a@b.com',
    website: 'https://shop.example.com',
    metadata: { websiteClass: 'real', greenfieldStatus: 'existing_website' },
    suppressed: false,
    hasActiveLead: true,
    analysisHasWebsite: true,
  }) === 'already_pursued',
  'already pursued beats has_website',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    email: 'a@b.com',
    website: 'https://shop.example.com',
    metadata: { websiteClass: 'real' },
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === 'has_website',
  'owned website is dumped',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    website: 'https://linktr.ee/salon',
    metadata: { websiteClass: 'link_in_bio' },
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: true,
  }) === 'has_website',
  'analysisHasWebsite dumps even link-in-bio row',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    email: null,
    facebookUrl: null,
    website: null,
    metadata: confirmedMeta({
      prospectProof: {
        ...confirmedMeta().prospectProof,
        contacts: [],
      },
    }),
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === 'no_contact_channel',
  'phone-only confirmed greenfield is no_contact_channel',
);

assert(
  classifyMissReason({
    phone: null,
    email: 'a@b.com',
    website: null,
    metadata: confirmedMeta(),
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === 'no_phone',
  'no phone is dumped',
);

// Plan B keepers still need confirmed status + dual contact
const planBKeepers = [
  { source: 'openstreetmap', phone: '+256701111111', email: 'a@test.com' },
  { source: 'public_search', phone: '+256702222222', email: 'b@test.com' },
].map((row) =>
  classifyMissReason({
    phone: row.phone,
    email: row.email,
    website: null,
    metadata: confirmedMeta(),
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }),
);
assert(
  planBKeepers.every((m) => m === null),
  'Plan B phone+email confirmed greenfield is a keeper',
);

assert(geoTierForCountry('Uganda') === 'core' || geoTierForCountry('Uganda') !== 'other', 'geo tier resolves');
assert(
  rankScore({
    score: 50,
    reviewCount: 0,
    hasWhatsAppHint: false,
    hasDemand: false,
    country: 'Uganda',
  }) > 0,
  'rank',
);
assert(hasWhatsAppHint({ website: 'https://wa.me/256700', metadata: null }), 'wa hint');
assert(recommendPitchChannel({ phone: '+2567', email: null, hasWhatsAppHint: true }) === 'whatsapp', 'channel');

const cut = cutKeepers(
  Array.from({ length: 5 }, (_, i) => ({
    accountId: `a${i}`,
    businessId: `b${i}`,
    rankScore: 100 - i,
  })),
  3,
);
assert(cut.keepers.length === 3, 'cut keepers');
assert(cut.remainder.length === 2, 'cut remainder');

const dates = purifyTargetDates(new Date('2026-10-14T04:00:00+03:00'));
assert(!!dates.harvestDate && !!dates.sellDate, 'purify dates');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
