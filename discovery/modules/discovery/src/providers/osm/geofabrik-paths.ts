import fs from 'node:fs';
import path from 'node:path';
import { getMonorepoRoot } from '@agency/config';

/** Geofabrik Uganda country extract (ODbL). */
export const GEOFABRIK_UGANDA_PBF_URL =
  'https://download.geofabrik.de/africa/uganda-latest.osm.pbf';

export const GEOFABRIK_EXTRACT_ID = 'uganda-latest';

export type GeofabrikPaths = {
  dir: string;
  pbfPath: string;
  indexPath: string;
  metaPath: string;
};

/**
 * Resolve extract paths relative to the discovery monorepo root (not process.cwd()).
 * OSM_PBF_PATH may point at the .pbf file or a directory containing it.
 */
export function resolveGeofabrikPaths(root = getMonorepoRoot()): GeofabrikPaths {
  const fromEnv = process.env.OSM_PBF_PATH?.trim();
  if (fromEnv) {
    const resolved = path.isAbsolute(fromEnv) ? fromEnv : path.resolve(root, fromEnv);
    if (resolved.toLowerCase().endsWith('.pbf') || resolved.toLowerCase().endsWith('.osm.pbf')) {
      const dir = path.dirname(resolved);
      return {
        dir,
        pbfPath: resolved,
        indexPath: path.join(dir, 'uganda-pois.ndjson'),
        metaPath: path.join(dir, 'uganda-pois.meta.json'),
      };
    }
    return {
      dir: resolved,
      pbfPath: path.join(resolved, 'uganda-latest.osm.pbf'),
      indexPath: path.join(resolved, 'uganda-pois.ndjson'),
      metaPath: path.join(resolved, 'uganda-pois.meta.json'),
    };
  }

  const dir = path.resolve(root, 'storage', 'osm');
  return {
    dir,
    pbfPath: path.join(dir, 'uganda-latest.osm.pbf'),
    indexPath: path.join(dir, 'uganda-pois.ndjson'),
    metaPath: path.join(dir, 'uganda-pois.meta.json'),
  };
}

export function geofabrikIndexReady(paths = resolveGeofabrikPaths()): boolean {
  return fs.existsSync(paths.indexPath) && fs.statSync(paths.indexPath).size > 0;
}

export function geofabrikPbfReady(paths = resolveGeofabrikPaths()): boolean {
  return fs.existsSync(paths.pbfPath) && fs.statSync(paths.pbfPath).size > 0;
}
