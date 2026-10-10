import { platformSettings } from '@agency/settings';
import { parseSocialSearchResultItem } from '../providers/social/parse-social-search-result';
import { SocialSearchProvider } from '../providers/social/social-search-provider';
import { buildSocialSearchQueries } from '../lib/build-social-search-queries';
import { getSocialSearchQueryLimit } from '../lib/run-profile';

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

const params = { country: 'Uganda', city: 'Kampala', industry: 'Restaurant' };

const tiktok = parseSocialSearchResultItem(
  {
    title: 'Kampala Eats (@kampalaeats) | TikTok',
    link: 'https://www.tiktok.com/@kampalaeats',
    snippet: 'Local food',
  },
  params,
  'site:tiktok.com Restaurant Kampala',
);
assert(tiktok?.source === 'social_search', 'tiktok source is social_search');
assert(tiktok?.externalId?.startsWith('social:tiktok:') === true, 'tiktok externalId prefix');
assert(tiktok?.metadata?.tiktokUrl?.includes('tiktok.com') === true, 'tiktok url in metadata');
assert(tiktok?.metadata?.primaryPlatform === 'tiktok', 'tiktok primary platform');

const linkedin = parseSocialSearchResultItem(
  {
    title: 'Kampala Eats | LinkedIn',
    link: 'https://www.linkedin.com/company/kampala-eats',
    snippet: 'Restaurant company page',
  },
  params,
  'site:linkedin.com/company Restaurant Kampala',
);
assert(linkedin?.source === 'social_search', 'linkedin source is social_search');
assert(linkedin?.metadata?.linkedinUrl?.includes('linkedin.com') === true, 'linkedin url in metadata');

const youtube = parseSocialSearchResultItem(
  {
    title: 'Kampala Kitchen - YouTube',
    link: 'https://www.youtube.com/@kampalakitchen',
    snippet: 'Channel',
  },
  params,
  'site:youtube.com Restaurant Kampala',
);
assert(youtube?.metadata?.youtubeUrl?.includes('youtube.com') === true, 'youtube url in metadata');

const twitter = parseSocialSearchResultItem(
  {
    title: 'Kampala Eats (@kampalaeats) / X',
    link: 'https://x.com/kampalaeats',
    snippet: 'Local eats',
  },
  params,
  'site:x.com Restaurant Kampala',
);
assert(twitter?.metadata?.twitterUrl?.includes('x.com') === true, 'x url in metadata');

const rejectedFacebook = parseSocialSearchResultItem(
  {
    title: "Joe's Kitchen | Facebook",
    link: 'https://www.facebook.com/joeskitchen',
    snippet: 'Restaurant',
  },
  params,
  'site:facebook.com Restaurant Kampala',
);
assert(rejectedFacebook === null, 'facebook hits rejected (Meta Graph handles FB)');

const rejectedWebsite = parseSocialSearchResultItem(
  {
    title: 'Joe Kitchen — Official Site',
    link: 'https://joekitchen.co.ug',
    snippet: 'Welcome',
  },
  params,
  'Restaurant Kampala',
);
assert(rejectedWebsite === null, 'generic website rejected');

const queries = buildSocialSearchQueries(params, 5);
assert(queries.some((q) => q.includes('site:tiktok.com')), 'queries include tiktok');
assert(queries.some((q) => q.includes('linkedin.com/company')), 'queries include linkedin');
assert(queries.some((q) => q.includes('site:x.com')), 'queries include x.com');
assert(!queries.some((q) => q.includes('facebook.com')), 'queries exclude facebook');
assert(!queries.some((q) => q.includes('instagram.com')), 'queries exclude instagram');

const tiktokOnly = buildSocialSearchQueries({ ...params, socialSearch: 'tiktok' }, 8);
assert(tiktokOnly.length > 0, 'tiktok-only still emits queries');
assert(tiktokOnly.every((q) => q.includes('site:tiktok.com')), 'tiktok-only has no LinkedIn/YouTube/X');

const youtubeOnly = buildSocialSearchQueries({ ...params, socialSearch: 'youtube' }, 8);
assert(youtubeOnly.length > 0, 'youtube-only emits queries');
assert(
  youtubeOnly.every((q) => q.includes('site:youtube.com')),
  'youtube-only has no TikTok/LinkedIn/X',
);
assert(!youtubeOnly.some((q) => q.includes('tiktok')), 'youtube-only excludes tiktok site');

const youtubeParsed = parseSocialSearchResultItem(
  {
    title: 'Kampala Kitchen - YouTube',
    link: 'https://www.youtube.com/@kampalakitchen',
    snippet: 'Local food channel',
  },
  { ...params, socialSearch: 'youtube' },
  'site:youtube.com Restaurant Kampala',
);
assert(youtubeParsed?.metadata?.primaryPlatform === 'youtube', 'youtube filter keeps YouTube rows');

const tiktokBlocked = parseSocialSearchResultItem(
  {
    title: 'Kampala Eats (@kampalaeats) | TikTok',
    link: 'https://www.tiktok.com/@kampalaeats',
    snippet: 'Local food',
  },
  { ...params, socialSearch: 'youtube' },
  'site:tiktok.com Restaurant Kampala',
);
assert(tiktokBlocked === null, 'youtube filter drops TikTok rows');

const linkedinBlocked = parseSocialSearchResultItem(
  {
    title: 'Acme Ltd | LinkedIn',
    link: 'https://www.linkedin.com/company/acme-ltd',
    snippet: 'Company',
  },
  { ...params, socialSearch: 'youtube' },
  'site:linkedin.com/company Restaurant Kampala',
);
assert(linkedinBlocked === null, 'youtube filter drops LinkedIn rows');

const xBlocked = parseSocialSearchResultItem(
  {
    title: 'Kampala Eats (@kampalaeats) / X',
    link: 'https://x.com/kampalaeats',
    snippet: 'Tweets',
  },
  { ...params, socialSearch: 'youtube' },
  'site:x.com Restaurant Kampala',
);
assert(xBlocked === null, 'youtube filter drops X rows');

const socialOff = buildSocialSearchQueries({ ...params, socialSearch: 'off' }, 8);
assert(socialOff.length === 0, 'social off emits no CSE queries');

async function runQueryLimitCheck() {
  await platformSettings.ensureLoaded();
  assert(getSocialSearchQueryLimit('economy') >= 4, 'economy social query limit configured');
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('skip social search integration tests (DATABASE_URL not set)');
    if (failed > 0) {
      console.error(`\n${failed} failed, ${passed} passed`);
      process.exit(1);
    }
    console.log(`\n${passed} passed`);
    return;
  }

  await platformSettings.ensureLoaded();
  await runQueryLimitCheck();
  await testDiscoverWithMockedSearch();

  if (failed > 0) {
    console.error(`\n${failed} failed, ${passed} passed`);
    process.exit(1);
  }
  console.log(`\n${passed} passed`);
}

async function testDiscoverWithMockedSearch() {
  const provider = new SocialSearchProvider();
  provider.isConfigured = async () => true;

  const client = (
    provider as unknown as {
      client: { isConfigured: () => boolean; searchQuery: Function };
    }
  ).client;
  client.isConfigured = () => true;
  client.searchQuery = async () => ({
    items: [
      {
        title: 'Kampala Eats (@kampalaeats) | TikTok',
        link: 'https://www.tiktok.com/@kampalaeats',
        snippet: 'Local food',
      },
      {
        title: 'Best Restaurants List',
        link: 'https://example.com/top-10-restaurants',
        snippet: 'Listicle',
      },
    ],
    cseCalls: 0,
    braveCalls: 1,
    bingCalls: 0,
    budgetExhausted: false,
    errors: [],
  });

  const result = await provider.discoverWithStats({
    ...params,
    acquisitionMode: 'standard',
  });

  assert(result.businesses.length >= 1, 'mock discover returns social profiles');
  assert(result.businesses.every((b) => b.source === 'social_search'), 'all results social_search source');
  assert(result.droppedNonSocial >= 1, 'non-social results dropped');
  assert(result.braveCalls >= 1, 'records Brave API calls from mocked client');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
