import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  haversineMeters,
  queryGeofabrikPoiIndex,
} from '../providers/osm/geofabrik-index';
import { osmElementToBusiness } from '../providers/osm/map-osm-result';
import { osmTagsForIndustry } from '../providers/osm/industry-tags';
import {
  geofabrikIndexReady,
  resolveGeofabrikPaths,
  type GeofabrikPaths,
} from '../providers/osm/geofabrik-paths';

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'geofabrik-test-'));
  const paths: GeofabrikPaths = {
    dir: tmp,
    pbfPath: path.join(tmp, 'uganda-latest.osm.pbf'),
    indexPath: path.join(tmp, 'uganda-pois.ndjson'),
    metaPath: path.join(tmp, 'uganda-pois.meta.json'),
  };

  const kampalaRestaurant = {
    id: 1001,
    type: 'node' as const,
    lat: 0.3476,
    lon: 32.5825,
    tags: {
      name: 'Kampala Kitchen',
      amenity: 'restaurant',
      phone: '+256700111222',
    },
  };

  const farCafe = {
    id: 1002,
    type: 'node' as const,
    lat: 0.05,
    lon: 32.1,
    tags: { name: 'Far Cafe', amenity: 'cafe' },
  };

  const salon = {
    id: 1003,
    type: 'node' as const,
    lat: 0.348,
    lon: 32.583,
    tags: { name: 'Pearl Spa', shop: 'beauty' },
  };

  fs.writeFileSync(
    paths.indexPath,
    [kampalaRestaurant, farCafe, salon].map((r) => JSON.stringify(r)).join('\n') + '\n',
    'utf8',
  );
  fs.writeFileSync(
    paths.metaPath,
    JSON.stringify({
      extractId: 'uganda-latest',
      pbfPath: paths.pbfPath,
      indexPath: paths.indexPath,
      builtAt: new Date().toISOString(),
      count: 3,
    }),
    'utf8',
  );

  assert.equal(geofabrikIndexReady(paths), true);

  const distNear = haversineMeters(0.3476, 32.5825, 0.348, 32.583);
  assert.ok(distNear < 2000, 'salon is near Kampala CBD');

  const filters = osmTagsForIndustry('Restaurant');
  const hits = await queryGeofabrikPoiIndex({
    lat: 0.3476,
    lon: 32.5825,
    radiusMeters: 8000,
    filters,
    limit: 20,
    paths,
  });

  assert.ok(
    hits.some((h) => h.id === 1001 && h.tags?.name === 'Kampala Kitchen'),
    'Kampala restaurant found in extract',
  );
  assert.ok(!hits.some((h) => h.id === 1002), 'far cafe outside radius excluded');
  assert.ok(!hits.some((h) => h.id === 1003), 'salon not in restaurant filters');

  const mapped = osmElementToBusiness(
    hits.find((h) => h.id === 1001)!,
    { country: 'Uganda', city: 'Kampala', industry: 'Restaurant' },
    'geofabrik_pbf',
    { extractId: 'uganda-latest', extractPath: paths.indexPath },
  );
  assert.ok(mapped);
  assert.equal(mapped?.source, 'openstreetmap');
  assert.equal(mapped?.metadata?.osmBackend, 'geofabrik_pbf');
  assert.equal(mapped?.metadata?.osmExtract, 'uganda-latest');
  assert.equal(mapped?.externalId, 'osm:node/1001');
  assert.ok(mapped?.phone?.includes('256'));
  const evidence = mapped?.metadata?.discoveryEvidence as
    | { phone?: { source?: string; backend?: string } }
    | undefined;
  assert.equal(evidence?.phone?.source, 'openstreetmap');
  assert.equal(evidence?.phone?.backend, 'geofabrik_pbf');

  const defaultPaths = resolveGeofabrikPaths();
  assert.ok(defaultPaths.pbfPath.includes('uganda'), 'default pbf name includes uganda');
  assert.ok(
    defaultPaths.dir.replace(/\\/g, '/').includes('/storage/osm'),
    'default dir is monorepo storage/osm',
  );

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('geofabrik-index tests passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
