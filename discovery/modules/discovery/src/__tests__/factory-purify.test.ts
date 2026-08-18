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

const greenfield = classifyMissReason({
  phone: '+256700000000',
  website: null,
  metadata: { businessStatus: 'OPERATIONAL', websiteClass: 'none' },
  suppressed: false,
  hasActiveLead: false,
  analysisHasWebsite: false,
});
assert(greenfield === null, 'eligible greenfield has no miss reason');
assert(
  classifyMissReason({
    phone: '+256700000000',
    website: null,
    metadata: null,
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
    website: null,
    metadata: null,
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
    snoozedUntil: new Date(Date.now() - 60_000),
  }) === null,
  'expired snooze can re-enter the pool',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    website: null,
    metadata: null,
    suppressed: true,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === 'suppressed',
  'suppressed beats other gates',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    website: 'https://example.com',
    metadata: { websiteClass: 'real' },
    suppressed: false,
    hasActiveLead: true,
    analysisHasWebsite: true,
  }) === 'already_pursued',
  'already pursued beats has_website',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
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
  }) === null,
  'link-in-bio stays eligible',
);

assert(
  classifyMissReason({
    phone: '  ',
    website: null,
    metadata: { businessStatus: 'OPERATIONAL' },
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === 'no_phone',
  'empty phone is dumped',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    website: null,
    metadata: { businessStatus: 'CLOSED_PERMANENTLY' },
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === 'not_operational',
  'closed places status is dumped',
);

assert(
  classifyMissReason({
    phone: '+256700000000',
    website: null,
    metadata: null,
    suppressed: false,
    hasActiveLead: false,
    analysisHasWebsite: false,
  }) === null,
  'missing businessStatus is treated as operational',
);

assert(geoTierForCountry('Uganda') === 'core', 'Uganda is core geo');
assert(geoTierForCountry('Ghana') === 'explore', 'Ghana is explore geo');
assert(geoTierForCountry('United States') === 'probe', 'Houston market is probe geo');

const coreScore = rankScore({
  score: 10,
  reviewCount: 50,
  hasWhatsAppHint: true,
  hasDemand: true,
  country: 'Uganda',
});
const exploreScore = rankScore({
  score: 10,
  reviewCount: 50,
  hasWhatsAppHint: true,
  hasDemand: true,
  country: 'Ghana',
});
assert(coreScore > exploreScore, 'core geo outranks explore at equal quality');
assert(coreScore === 10 * 10 + 50 + 80 + 60 + 40, 'rank formula matches spec weights');

const cut = cutKeepers(
  Array.from({ length: 103 }, (_, i) => ({ id: i, rankScore: 103 - i })),
  100,
);
assert(cut.keepers.length === 100, 'cut keeps 100');
assert(cut.remainder.length === 3, 'cut remainder is over_cut pool');
assert(cut.keepers[0]?.rankScore === 103, 'cut sorts highest first');

assert(recommendPitchChannel({ phone: '+2567', hasWhatsAppHint: true }) === 'whatsapp', 'WhatsApp when hinted');
assert(recommendPitchChannel({ phone: '+2567', hasWhatsAppHint: false }) === 'phone', 'phone when no WhatsApp hint');
assert(recommendPitchChannel({ email: 'a@b.com' }) === 'email', 'email when no phone');
assert(recommendPitchChannel({}) === 'follow_up', 'follow_up when unreachable');
assert(hasWhatsAppHint({ website: 'https://wa.me/256700' }) === true, 'wa.me is a WhatsApp hint');
assert(hasWhatsAppHint({ metadata: { crawl: { whatsappUrl: 'https://wa.me/1' } } }) === true, 'crawl whatsappUrl is a hint');
assert(hasWhatsAppHint({ website: 'https://example.com' }) === false, 'plain site is not WhatsApp');

const night = purifyTargetDates(new Date('2026-08-18T19:00:00.000Z'));
assert(night.inWindow && night.harvestDate === '2026-08-18' && night.sellDate === '2026-08-19', '22:00 EAT purifies today for tomorrow');

const preDawn = purifyTargetDates(new Date('2026-08-18T03:30:00.000Z'));
assert(preDawn.inWindow && preDawn.harvestDate === '2026-08-17' && preDawn.sellDate === '2026-08-18', '06:30 EAT purifies yesterday for today');

const morning = purifyTargetDates(new Date('2026-08-18T04:00:00.000Z'));
assert(!morning.inWindow && morning.sellDate === '2026-08-18' && morning.harvestDate === '2026-08-17', '07:00 EAT is frozen daytime — harvest feeds tomorrow');

const afternoon = purifyTargetDates(new Date('2026-08-18T12:00:00.000Z'));
assert(!afternoon.inWindow, 'afternoon worker does not purify');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
