import assert from 'node:assert/strict';
import {
  getPlacesLifecycle,
  isGoogleAcquisitionDisabledByEnv,
  isGoogleCircuitOpen,
  isGoogleConsumerSuspendedError,
  resetGoogleCircuit,
  tripGoogleCircuit,
} from '../providers/google-circuit';
import { GooglePlacesDetailsProvider } from '../providers/places/places-details';
import { osmTagsForIndustry } from '../providers/osm/industry-tags';
import { buildAroundQuery } from '../providers/osm/overpass-client';
import {
  factoryPlanNeedsSourceHeal,
  factoryPlanNeedsFilterHeal,
  factorySourcesForSeed,
  survivalDiscoverySources,
} from '../plans/factory-credentials';

async function main() {
  resetGoogleCircuit();

  assert.equal(isGoogleConsumerSuspendedError(403, 'CONSUMER_SUSPENDED', 'x'), true);
  assert.equal(
    isGoogleConsumerSuspendedError(403, undefined, 'Consumer has been suspended'),
    true,
  );
  assert.equal(isGoogleConsumerSuspendedError(500, undefined, 'oops'), false);

  tripGoogleCircuit('places', 'test', 60_000);
  assert.equal(isGoogleCircuitOpen('places'), true);
  assert.equal(getPlacesLifecycle(), 'dormant');
  assert.equal(isGoogleCircuitOpen('cse'), false);

  // places_enrich must no-op cleanly while dormant (no Places API / DB).
  const details = new GooglePlacesDetailsProvider();
  const enrich = await details.enrichTopScoredForRun('run-dormant-noop');
  assert.equal(enrich.skipped, true);
  assert.equal(enrich.reason, 'places_dormant');
  assert.equal(enrich.attempted, 0);
  assert.equal(enrich.enriched, 0);
  assert.deepEqual(enrich.enrichedBusinessIds, []);

  resetGoogleCircuit('places');
  assert.equal(isGoogleCircuitOpen('places'), false);
  assert.equal(getPlacesLifecycle(), 'active');

  const restaurant = osmTagsForIndustry('Restaurant');
  assert.ok(restaurant.some((t) => t.key === 'amenity' && t.value === 'restaurant'));

  const q = buildAroundQuery(restaurant.slice(0, 1), 0.3, 32.5, 8000);
  assert.match(q, /around:8000/);
  assert.match(q, /amenity/);

  const survival = survivalDiscoverySources();
  assert.ok(survival.includes('openstreetmap'));
  assert.ok(survival.includes('social_search'));
  assert.ok(survival.includes('facebook'));
  assert.ok(survival.includes('public_search'));
  assert.ok(survival.includes('csv_import'));
  assert.ok(!survival.includes('google_maps'));

  assert.ok(factorySourcesForSeed(false).includes('social_search'));
  assert.ok(factorySourcesForSeed(true).includes('google_maps'));
  assert.ok(factorySourcesForSeed(true).includes('openstreetmap'));

  assert.equal(factoryPlanNeedsSourceHeal(['google_maps'], false), true);
  assert.equal(factoryPlanNeedsSourceHeal(['openstreetmap', 'public_search'], false), true);
  assert.equal(
    factoryPlanNeedsSourceHeal(
      ['openstreetmap', 'public_search', 'facebook', 'social_search', 'csv_import'],
      false,
    ),
    false,
  );
  assert.equal(factoryPlanNeedsSourceHeal(['google_maps'], true), true);
  assert.equal(
    factoryPlanNeedsSourceHeal(['google_maps', 'openstreetmap', 'public_search'], true),
    false,
  );

  assert.equal(factoryPlanNeedsFilterHeal({ socialSearch: 'all' }), true);
  assert.equal(factoryPlanNeedsFilterHeal({ socialSearch: 'tiktok' }), true);
  assert.equal(factoryPlanNeedsFilterHeal({ socialSearch: 'youtube' }), false);
  assert.equal(factoryPlanNeedsFilterHeal({}), true);

  void isGoogleAcquisitionDisabledByEnv();

  console.log('survival-osm-circuit tests passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
