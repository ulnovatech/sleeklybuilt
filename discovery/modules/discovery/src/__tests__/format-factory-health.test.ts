import assert from 'node:assert/strict';
import {
  formatFactoryHealthCheckLine,
  formatFactoryHealthHeader,
} from '../lib/format-factory-health';

const header = formatFactoryHealthHeader(
  { ready: true, survivalMode: true, placesLifecycle: 'dormant' },
  {
    summary: 'Geofabrik index fresh (0d old · 12 POIs)',
    builtAt: '2026-10-04T00:00:00.000Z',
    paths: {
      dir: '/tmp/osm',
      pbfPath: '/tmp/osm/uganda-latest.osm.pbf',
      indexPath: '/tmp/osm/uganda-pois.ndjson',
      metaPath: '/tmp/osm/uganda-pois.meta.json',
    },
  },
);

assert.ok(header.some((l) => l.includes('Plan B factory health')));
assert.ok(header.some((l) => l.includes('Places lifecycle: dormant')));
assert.ok(header.some((l) => l.includes('survivalMode=yes')));
assert.ok(header.some((l) => l.includes('Factory harvest ready: yes')));
assert.ok(header.some((l) => l.includes('Geofabrik index fresh')));

assert.match(
  formatFactoryHealthCheckLine({
    label: 'Google Places',
    ready: false,
    required: false,
    lifecycle: 'dormant',
    reason: 'DORMANT',
  }),
  /Google Places \[dormant\]: optional-off — DORMANT/,
);

assert.match(
  formatFactoryHealthCheckLine({
    label: 'OpenStreetMap (free)',
    ready: true,
    required: true,
  }),
  /OpenStreetMap \(free\): ready$/,
);

console.log('format-factory-health tests passed');
