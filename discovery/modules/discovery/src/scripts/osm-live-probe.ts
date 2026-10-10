import { loadRootEnv } from '@agency/config/load-env';
import { platformSettings } from '@agency/settings';
import {
  OsmDiscoveryProvider,
  preferGeofabrikExtract,
  geofabrikIndexReady,
  resolveGeofabrikPaths,
  readGeofabrikIndexMeta,
} from '../index';

loadRootEnv();

async function main() {
  const p = resolveGeofabrikPaths();
  console.log(
    JSON.stringify(
      {
        ready: geofabrikIndexReady(p),
        prefer: preferGeofabrikExtract(),
        meta: readGeofabrikIndexMeta(p),
      },
      null,
      2,
    ),
  );

  // Probe may run without DATABASE_URL — acquisition mode defaults via settings cache.
  const orig = platformSettings.ensureLoaded.bind(platformSettings);
  platformSettings.ensureLoaded = async () => undefined as never;
  try {
    const osm = new OsmDiscoveryProvider();
    const r = await osm.discoverWithStats({
      country: 'Uganda',
      city: 'Kampala',
      industry: 'Restaurant',
    });
    console.log(
      JSON.stringify(
        {
          backend: r.backend,
          count: r.businesses.length,
          withPhone: r.businesses.filter((b) => b.phone).length,
          sample: r.businesses.slice(0, 5).map((b) => ({
            name: b.name,
            phone: b.phone,
            backend: b.metadata?.osmBackend,
            extract: b.metadata?.osmExtract,
            externalId: b.externalId,
          })),
        },
        null,
        2,
      ),
    );
  } finally {
    platformSettings.ensureLoaded = orig;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
