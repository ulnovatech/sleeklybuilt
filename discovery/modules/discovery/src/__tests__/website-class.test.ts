import assert from 'node:assert/strict';
import {
  classifyWebsiteClass,
  countsAsOwnedWebsiteForScoring,
  deriveWebsiteClassFromCrawl,
  keepOnMorningPath,
  mergeWebsiteClass,
  resolveWebsiteClass,
  websiteClassLabel,
} from '../lib/website-class';

assert.equal(classifyWebsiteClass(undefined), 'none');
assert.equal(classifyWebsiteClass('https://linktr.ee/shop'), 'link_in_bio');
assert.equal(
  classifyWebsiteClass('https://joekitchen.example'),
  'uncertain',
  'uncrawled owned URL is uncertain, not real',
);

assert.equal(
  deriveWebsiteClassFromCrawl({
    website: 'https://dead.example',
    crawlStatus: 'unreachable',
  }),
  'broken',
);
assert.equal(
  deriveWebsiteClassFromCrawl({
    website: 'https://weak.example',
    crawlStatus: 'ok',
    httpsEnabled: false,
    mobileFriendly: true,
  }),
  'low_quality',
);
assert.equal(
  deriveWebsiteClassFromCrawl({
    website: 'https://weak.example',
    crawlStatus: 'ok',
    httpsEnabled: true,
    mobileFriendly: false,
  }),
  'low_quality',
);
assert.equal(
  deriveWebsiteClassFromCrawl({
    website: 'https://good.example',
    crawlStatus: 'ok',
    httpsEnabled: true,
    mobileFriendly: true,
  }),
  'real',
);
assert.equal(
  deriveWebsiteClassFromCrawl({
    website: 'https://blocked.example',
    crawlStatus: 'blocked',
  }),
  'uncertain',
);
assert.equal(
  deriveWebsiteClassFromCrawl({
    website: 'https://linktr.ee/x',
    crawlStatus: 'ok',
    httpsEnabled: true,
    mobileFriendly: true,
  }),
  'link_in_bio',
);
assert.equal(
  deriveWebsiteClassFromCrawl({
    website: null,
    crawlStatus: 'no_website',
  }),
  'none',
);

assert.ok(keepOnMorningPath({ website: undefined }));
assert.ok(keepOnMorningPath({ website: 'https://linktr.ee/x' }));
assert.ok(keepOnMorningPath({ website: 'https://maybe.example' }));
assert.ok(
  keepOnMorningPath({
    website: 'https://dead.example',
    metadata: { websiteClass: 'broken' },
  }),
  'broken stays on morning path',
);
assert.ok(
  keepOnMorningPath({
    website: 'https://weak.example',
    metadata: { websiteClass: 'low_quality' },
  }),
  'low_quality stays on morning path',
);
assert.ok(
  keepOnMorningPath({
    website: 'https://blocked.example',
    metadata: { websiteClass: 'uncertain' },
  }),
);
assert.ok(
  !keepOnMorningPath({
    website: 'https://good.example',
    metadata: { websiteClass: 'real' },
  }),
  'real excluded from morning path',
);

assert.equal(countsAsOwnedWebsiteForScoring('real'), true);
assert.equal(countsAsOwnedWebsiteForScoring('broken'), false);
assert.equal(countsAsOwnedWebsiteForScoring('low_quality'), false);
assert.equal(countsAsOwnedWebsiteForScoring('uncertain'), false);

assert.equal(
  resolveWebsiteClass({
    website: 'https://good.example',
    metadata: { websiteClass: 'broken' },
  }),
  'broken',
  'tagged class wins over URL heuristic',
);

assert.ok(websiteClassLabel('broken').toLowerCase().includes('broken'));

assert.equal(mergeWebsiteClass('real', 'uncertain'), 'real');
assert.equal(mergeWebsiteClass('broken', 'uncertain'), 'broken');
assert.equal(mergeWebsiteClass('uncertain', 'real'), 'real');
assert.equal(mergeWebsiteClass('uncertain', 'low_quality'), 'low_quality');

console.log('website-class tests passed');
