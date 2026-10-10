import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { platformSettings } from '@agency/settings';
import { OsmDiscoveryProvider } from '../providers/osm/osm-discover';

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'osm-fallback-'));
  const indexPath = path.join(tmp, 'uganda-pois.ndjson');
  // Index present but no restaurant near Kampala → extract yields 0 businesses
  fs.writeFileSync(
    indexPath,
    `${JSON.stringify({
      id: 1,
      type: 'node',
      lat: -1.0,
      lon: 30.0,
      tags: { name: 'Far Shop', shop: 'convenience' },
    })}\n`,
    'utf8',
  );
  fs.writeFileSync(
    path.join(tmp, 'uganda-pois.meta.json'),
    JSON.stringify({
      extractId: 'uganda-latest',
      pbfPath: path.join(tmp, 'uganda-latest.osm.pbf'),
      indexPath,
      builtAt: new Date().toISOString(),
      count: 1,
    }),
    'utf8',
  );

  const prevPbf = process.env.OSM_PBF_PATH;
  const prevForce = process.env.OSM_FORCE_OVERPASS;
  process.env.OSM_PBF_PATH = tmp;
  delete process.env.OSM_FORCE_OVERPASS;

  const origEnsure = platformSettings.ensureLoaded.bind(platformSettings);
  platformSettings.ensureLoaded = async () => undefined as never;

  const origFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('nominatim.openstreetmap.org')) {
      return new Response(
        JSON.stringify([{ lat: '0.3476', lon: '32.5825', display_name: 'Kampala' }]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (url.includes('overpass') || url.includes('interpreter')) {
      assert.equal(init?.method, 'POST', 'Overpass uses POST');
      return new Response(
        JSON.stringify({
          elements: [
            {
              type: 'way',
              id: 999001,
              center: { lat: 0.3477, lon: 32.5826 },
              tags: {
                name: 'Overpass Only Bistro',
                amenity: 'restaurant',
                phone: '+256700999888',
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }
    return origFetch(input, init);
  }) as typeof fetch;

  try {
    const osm = new OsmDiscoveryProvider();
    const result = await osm.discoverWithStats({
      country: 'Uganda',
      city: 'Kampala',
      industry: 'Restaurant',
    });

    assert.equal(result.backend, 'overpass', 'empty extract falls back to Overpass');
    assert.ok(result.businesses.length >= 1, 'Overpass way mapped');
    assert.equal(result.businesses[0]?.metadata?.osmBackend, 'overpass');
    assert.equal(result.businesses[0]?.externalId, 'osm:way/999001');
    assert.ok(!result.businesses[0]?.metadata?.osmExtract, 'overpass path has no extract id');
  } finally {
    globalThis.fetch = origFetch;
    platformSettings.ensureLoaded = origEnsure;
    if (prevPbf === undefined) delete process.env.OSM_PBF_PATH;
    else process.env.OSM_PBF_PATH = prevPbf;
    if (prevForce === undefined) delete process.env.OSM_FORCE_OVERPASS;
    else process.env.OSM_FORCE_OVERPASS = prevForce;
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  console.log('osm-geofabrik-fallback tests passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
