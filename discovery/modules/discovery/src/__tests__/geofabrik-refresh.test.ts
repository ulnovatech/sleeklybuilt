import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  GEOFABRIK_REFRESH_CRON_HINT,
  GEOFABRIK_REFRESH_INTERVAL_MS,
  geofabrikExtractStatus,
} from '../providers/osm/geofabrik-refresh';
import type { GeofabrikPaths } from '../providers/osm/geofabrik-paths';

assert.ok(GEOFABRIK_REFRESH_INTERVAL_MS === 7 * 24 * 60 * 60 * 1000);
assert.equal(GEOFABRIK_REFRESH_CRON_HINT, '0 3 * * 0');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'geofabrik-refresh-'));
const paths: GeofabrikPaths = {
  dir: tmp,
  pbfPath: path.join(tmp, 'uganda-latest.osm.pbf'),
  indexPath: path.join(tmp, 'uganda-pois.ndjson'),
  metaPath: path.join(tmp, 'uganda-pois.meta.json'),
};

const missing = geofabrikExtractStatus(new Date(), paths);
assert.equal(missing.indexReady, false);
assert.equal(missing.stale, true);
assert.match(missing.summary, /missing|osm-geofabrik/i);

fs.writeFileSync(paths.indexPath, '{"id":1}\n', 'utf8');
fs.writeFileSync(
  paths.metaPath,
  JSON.stringify({
    extractId: 'uganda-latest',
    pbfPath: paths.pbfPath,
    indexPath: paths.indexPath,
    builtAt: new Date().toISOString(),
    count: 12,
  }),
  'utf8',
);

const fresh = geofabrikExtractStatus(new Date(), paths);
assert.equal(fresh.indexReady, true);
assert.equal(fresh.stale, false);
assert.equal(fresh.ageDays, 0);
assert.match(fresh.summary, /fresh/i);

const oldBuilt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
fs.writeFileSync(
  paths.metaPath,
  JSON.stringify({
    extractId: 'uganda-latest',
    pbfPath: paths.pbfPath,
    indexPath: paths.indexPath,
    builtAt: oldBuilt,
    count: 12,
  }),
  'utf8',
);
const stale = geofabrikExtractStatus(new Date(), paths);
assert.equal(stale.stale, true);
assert.ok((stale.ageDays ?? 0) >= 7);
assert.match(stale.summary, /stale/i);

fs.rmSync(tmp, { recursive: true, force: true });
console.log('geofabrik-refresh tests passed');
