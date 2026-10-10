/**
 * Geofabrik Uganda extract refresh policy (Plan B Chunk 10).
 * Weekly refresh keeps the local POI index current without Overpass dependency.
 */

import fs from 'node:fs';
import {
  geofabrikIndexReady,
  geofabrikPbfReady,
  resolveGeofabrikPaths,
  type GeofabrikPaths,
} from './geofabrik-paths';
import { readGeofabrikIndexMeta, type GeofabrikIndexMeta } from './geofabrik-index';

/** Recommended max age before operators should re-run `pnpm discovery:osm-geofabrik`. */
export const GEOFABRIK_REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

/** Cron-style hint for worker-host schedulers (Sunday 03:00 Africa/Kampala). */
export const GEOFABRIK_REFRESH_CRON_HINT = '0 3 * * 0';

export const GEOFABRIK_REFRESH_TIMEZONE = 'Africa/Kampala';

export type GeofabrikExtractStatus = {
  indexReady: boolean;
  pbfReady: boolean;
  meta: GeofabrikIndexMeta | null;
  builtAt: string | null;
  ageMs: number | null;
  ageDays: number | null;
  stale: boolean;
  /** Operator-facing one-liner */
  summary: string;
  paths: GeofabrikPaths;
};

export function geofabrikExtractStatus(
  now = new Date(),
  paths = resolveGeofabrikPaths(),
): GeofabrikExtractStatus {
  const indexReady = geofabrikIndexReady(paths);
  const pbfReady = geofabrikPbfReady(paths);
  const meta = readGeofabrikIndexMeta(paths);
  const builtAt = meta?.builtAt ?? null;
  let ageMs: number | null = null;
  if (builtAt) {
    const t = Date.parse(builtAt);
    if (!Number.isNaN(t)) ageMs = Math.max(0, now.getTime() - t);
  } else if (indexReady) {
    try {
      ageMs = Math.max(0, now.getTime() - fs.statSync(paths.indexPath).mtimeMs);
    } catch {
      ageMs = null;
    }
  }
  const ageDays = ageMs != null ? Math.floor(ageMs / (24 * 60 * 60 * 1000)) : null;
  const stale = ageMs != null ? ageMs >= GEOFABRIK_REFRESH_INTERVAL_MS : !indexReady;

  let summary: string;
  if (!indexReady) {
    summary = 'Geofabrik index missing — run pnpm discovery:osm-geofabrik (Overpass fallback until then)';
  } else if (stale) {
    summary = `Geofabrik index stale (${ageDays ?? '?'}d old) — refresh weekly with pnpm discovery:osm-geofabrik`;
  } else {
    const count = meta?.count != null ? ` · ${meta.count} POIs` : '';
    summary = `Geofabrik index fresh (${ageDays ?? 0}d old${count})`;
  }

  return {
    indexReady,
    pbfReady,
    meta,
    builtAt,
    ageMs,
    ageDays,
    stale,
    summary,
    paths,
  };
}
