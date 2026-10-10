import { platformSettings } from '@agency/settings';
import { buildMetaSearchQueries } from '../lib/build-meta-search-queries';
import { getMetaGraphPagesPerQuery } from '../lib/run-profile';
import {
  mapMetaPageToDiscoveredBusiness,
  mapMetaPlaceToDiscoveredBusiness,
} from '../providers/meta/map-meta-result';
import { MetaGraphClient } from '../providers/meta/meta-graph-client';
import { MetaGraphDiscoveryProvider } from '../providers/meta/meta-graph-provider';
import {
  evaluateMetaPagesSearchCapability,
  isMetaPagesSearchCapabilityError,
  isMetaPagesSearchReady,
  markMetaPagesSearchGate,
  metaPagesSearchGateReason,
  resetMetaPagesSearchGate,
} from '../providers/meta/meta-pages-search-gate';

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

const pageMapped = mapMetaPageToDiscoveredBusiness(
  {
    id: '123456',
    name: 'Kampala Kitchen',
    link: 'https://www.facebook.com/kampalakitchen',
    phone: '+256700111222',
    website: 'https://kampalakitchen.example',
    category: 'Restaurant',
    fan_count: 1200,
    location: { city: 'Kampala', country: 'Uganda' },
    instagram_business_account: {
      id: 'ig-999',
      username: 'kampalakitchen',
      name: 'Kampala Kitchen IG',
    },
  },
  params,
  'Restaurant Kampala',
);

assert(pageMapped.length === 2, 'page with IG yields facebook + instagram rows');
assert(pageMapped[0]?.source === 'facebook', 'first row is facebook source');
assert(pageMapped[0]?.externalId === 'meta:page:123456', 'facebook externalId format');
assert(pageMapped[0]?.metadata?.metaApi === 'pages_search', 'page metadata marks pages_search');
assert(pageMapped[1]?.source === 'instagram', 'second row is instagram source');
assert(pageMapped[1]?.externalId === 'meta:ig:ig-999', 'instagram externalId format');
assert(
  pageMapped[0]?.instagramUrl === 'https://www.instagram.com/kampalakitchen/',
  'instagram URL from username',
);

const placeMapped = mapMetaPlaceToDiscoveredBusiness(
  {
    id: 'place-42',
    name: 'City Spa',
    link: 'https://www.facebook.com/cityspa',
    location: { city: 'Kampala', country: 'Uganda' },
    category: 'Spa',
  },
  params,
  'Spa Kampala',
);

assert(placeMapped?.source === 'facebook', 'legacy place mapper still maps facebook source');
assert(placeMapped?.externalId === 'meta:place:place-42', 'place externalId format');

const queries = buildMetaSearchQueries(params, 5);
assert(queries.length >= 2, 'builds multiple meta queries');
assert(queries[0].includes('Restaurant'), 'query includes industry');

assert(getMetaGraphPagesPerQuery('standard') === 1, 'standard meta pages per query');
assert(getMetaGraphPagesPerQuery('boost') === 2, 'boost meta pages per query');

// --- Pages Search gate ---
const savedReady = process.env.META_PAGES_SEARCH_READY;
delete process.env.META_PAGES_SEARCH_READY;
resetMetaPagesSearchGate();
assert(!isMetaPagesSearchReady(), 'gate unknown is not ready');
assert(
  (metaPagesSearchGateReason() ?? '').includes('not probed'),
  'unknown gate explains probe CLI',
);

markMetaPagesSearchGate('green', 'test green', 2);
assert(isMetaPagesSearchReady(), 'fresh green probe is ready');
assert(evaluateMetaPagesSearchCapability().ready, 'evaluate ready when green');

markMetaPagesSearchGate('red', 'permission denied', 0);
assert(!isMetaPagesSearchReady(), 'red gate is not ready');
assert(
  (evaluateMetaPagesSearchCapability().reason ?? '').includes('permission'),
  'red reason surfaced',
);

process.env.META_PAGES_SEARCH_READY = 'true';
assert(isMetaPagesSearchReady(), 'env override forces green');
process.env.META_PAGES_SEARCH_READY = 'false';
assert(!isMetaPagesSearchReady(), 'env override forces red');

assert(
  isMetaPagesSearchCapabilityError({ code: 10, message: 'permission' }),
  'code 10 is capability error',
);
assert(
  isMetaPagesSearchCapabilityError({
    message: 'Unsupported get request',
  }),
  'unsupported path is capability error',
);
assert(
  !isMetaPagesSearchCapabilityError({ code: 4, message: 'rate limit' }),
  'rate limit alone is not capability error',
);

if (savedReady === undefined) delete process.env.META_PAGES_SEARCH_READY;
else process.env.META_PAGES_SEARCH_READY = savedReady;
resetMetaPagesSearchGate();

async function withStubbedSettingsLoad<T>(fn: () => Promise<T>): Promise<T> {
  const orig = platformSettings.ensureLoaded.bind(platformSettings);
  platformSettings.ensureLoaded = async () => undefined as never;
  try {
    return await fn();
  } finally {
    platformSettings.ensureLoaded = orig;
  }
}

async function testDiscoverWithMockedClient() {
  const saved = process.env.META_PAGES_SEARCH_READY;
  process.env.META_PAGES_SEARCH_READY = 'true';
  resetMetaPagesSearchGate();

  await withStubbedSettingsLoad(async () => {
    const provider = new MetaGraphDiscoveryProvider();
    const client = (
      provider as unknown as {
        client: {
          isConfigured: () => boolean;
          searchPages: Function;
        };
      }
    ).client;

    client.isConfigured = () => true;
    client.searchPages = async () => ({
      data: [
        {
          id: 'page-1',
          name: 'Mock Cafe',
          link: 'https://www.facebook.com/mockcafe',
          location: { city: 'Kampala', country: 'Uganda' },
          instagram_business_account: {
            id: 'ig-1',
            username: 'mockcafe',
          },
        },
      ],
    });
    assert(
      typeof (client as { searchPlaces?: unknown }).searchPlaces !== 'function',
      'client has no searchPlaces (deprecated)',
    );

    const governor = (
      provider as unknown as {
        governor: { canSpend: Function; recordSpend: Function };
      }
    ).governor;
    governor.canSpend = async () => true;
    governor.recordSpend = async () => undefined;

    const result = await provider.discoverWithStats({
      ...params,
      acquisitionMode: 'standard',
    });

    assert(result.placesFound === 0, 'placesFound always 0 after pages/search migration');
    assert(result.gateStatus === 'green', 'discover reports green gate');
    assert(result.businesses.length >= 2, 'mock discover returns page + linked IG');
    assert(result.apiCalls >= 1, 'records API calls for pages search only');
    assert(
      result.businesses.some((b) => b.externalId === 'meta:page:page-1'),
      'includes mocked page',
    );
    assert(
      result.businesses.some((b) => b.externalId === 'meta:ig:ig-1'),
      'includes linked Instagram from page',
    );
    assert(
      !result.businesses.some((b) => b.externalId?.startsWith('meta:place:')),
      'does not emit place rows',
    );
  });

  if (saved === undefined) delete process.env.META_PAGES_SEARCH_READY;
  else process.env.META_PAGES_SEARCH_READY = saved;
  resetMetaPagesSearchGate();
}

async function testGateBlocksDiscover() {
  const saved = process.env.META_PAGES_SEARCH_READY;
  process.env.META_PAGES_SEARCH_READY = 'false';
  resetMetaPagesSearchGate();

  await withStubbedSettingsLoad(async () => {
    const provider = new MetaGraphDiscoveryProvider();
    const client = (
      provider as unknown as {
        client: { isConfigured: () => boolean; searchPages: Function };
      }
    ).client;
    client.isConfigured = () => true;
    let searchCalled = false;
    client.searchPages = async () => {
      searchCalled = true;
      return { data: [] };
    };

    const result = await provider.discoverWithStats({
      ...params,
      acquisitionMode: 'economy',
    });

    assert(result.gateStatus === 'red', 'forced RED skips discover');
    assert(result.businesses.length === 0, 'no businesses when gate RED');
    assert(!searchCalled, 'does not call pages/search when forced RED');
  });

  if (saved === undefined) delete process.env.META_PAGES_SEARCH_READY;
  else process.env.META_PAGES_SEARCH_READY = saved;
  resetMetaPagesSearchGate();
}

async function testLiveToken() {
  if (!process.env.META_GRAPH_API_TOKEN) {
    console.log('skip live Meta Graph test (META_GRAPH_API_TOKEN not set)');
    return;
  }

  const provider = new MetaGraphDiscoveryProvider();
  const client = new MetaGraphClient();
  const probe = await client.probePagesSearch('restaurant Kampala');
  console.log(`live probe: ${probe.status} — ${probe.reason}`);
  assert(probe.status === 'green' || probe.status === 'red', 'live probe returns green or red');

  if (probe.ok) {
    const configured = await provider.isConfigured();
    assert(configured, 'live GREEN means provider configured');
    const results = await provider.discover({
      country: 'Uganda',
      city: 'Kampala',
      industry: 'Restaurant',
      acquisitionMode: 'economy',
    });
    assert(Array.isArray(results), 'live discover returns array');
    console.log(`live meta pages/search returned ${results.length} businesses`);
  } else {
    console.log('documented RED gate — App Review / token permissions required for GREEN path');
    assert(!(await provider.isConfigured()), 'RED gate → provider not configured');
  }
}

testDiscoverWithMockedClient()
  .then(() => testGateBlocksDiscover())
  .then(() => testLiveToken())
  .then(() => {
    if (failed > 0) {
      console.error(`\n${failed} failed, ${passed} passed`);
      process.exit(1);
    }
    console.log(`\n${passed} passed`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
