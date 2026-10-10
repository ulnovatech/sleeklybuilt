import { loadRootEnv } from '@agency/config/load-env';
import {
  buildGeofabrikPoiIndex,
  downloadGeofabrikUgandaPbf,
  geofabrikExtractStatus,
  geofabrikIndexReady,
  geofabrikPbfReady,
  queryGeofabrikPoiIndex,
  resolveGeofabrikPaths,
  osmTagsForIndustry,
} from '@agency/discovery';

loadRootEnv();

async function main() {
  const args = process.argv.slice(2);
  const downloadOnly = args.includes('--download-only');
  const indexOnly = args.includes('--index-only');
  const statusOnly = args.includes('--status');
  const probe = args.includes('--probe');

  const paths = resolveGeofabrikPaths();
  console.log(`Geofabrik paths:`);
  console.log(`  dir:   ${paths.dir}`);
  console.log(`  pbf:   ${paths.pbfPath}`);
  console.log(`  index: ${paths.indexPath}`);

  if (statusOnly) {
    const extract = geofabrikExtractStatus(new Date(), paths);
    console.log(`PBF ready:   ${extract.pbfReady}`);
    console.log(`Index ready: ${extract.indexReady}`);
    console.log(`Stale (>7d): ${extract.stale}`);
    console.log(`Status:      ${extract.summary}`);
    if (extract.meta) {
      console.log(`Index meta:  ${extract.meta.count} POIs · built ${extract.meta.builtAt}`);
    }
    process.exit(extract.indexReady ? 0 : 1);
  }

  if (!indexOnly) {
    const dl = await downloadGeofabrikUgandaPbf(paths);
    console.log(`Downloaded ${dl.bytes} bytes → ${dl.pbfPath}`);
  } else if (!geofabrikPbfReady(paths)) {
    console.error('No PBF on disk. Run without --index-only first.');
    process.exit(1);
  }

  if (!downloadOnly) {
    const meta = await buildGeofabrikPoiIndex(paths);
    console.log(`Indexed ${meta.count} named POI nodes → ${meta.indexPath}`);
  }

  if (probe) {
    const filters = osmTagsForIndustry('Restaurant');
    // Kampala CBD approx
    const hits = await queryGeofabrikPoiIndex({
      lat: 0.3476,
      lon: 32.5825,
      radiusMeters: 8000,
      filters,
      limit: 20,
      paths,
    });
    console.log(`Probe Restaurant @ Kampala: ${hits.length} hits (showing up to 5)`);
    for (const h of hits.slice(0, 5)) {
      console.log(`  - ${h.tags?.name} (osm:node/${h.id})`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
