import fs from 'node:fs';
import readline from 'node:readline';
import { createOSMStream } from 'osm-pbf-parser-node';
import { logger } from '@agency/config';
import type { OsmTagFilter } from './industry-tags';
import {
  GEOFABRIK_EXTRACT_ID,
  resolveGeofabrikPaths,
  type GeofabrikPaths,
} from './geofabrik-paths';
import type { OsmElement } from './overpass-client';

export type IndexedOsmPoi = {
  id: number;
  type: 'node';
  lat: number;
  lon: number;
  tags: Record<string, string>;
};

export type GeofabrikIndexMeta = {
  extractId: string;
  pbfPath: string;
  indexPath: string;
  builtAt: string;
  count: number;
  sourceUrl?: string;
};

const POI_TAG_KEYS = [
  'amenity',
  'shop',
  'office',
  'tourism',
  'leisure',
  'craft',
  'healthcare',
] as const;

const KEEP_TAG_KEYS = [
  'name',
  'name:en',
  'phone',
  'contact:phone',
  'contact:mobile',
  'mobile',
  'website',
  'contact:website',
  'url',
  ...POI_TAG_KEYS,
  'sport',
];

function hasName(tags: Record<string, string>): boolean {
  return !!(tags.name?.trim() || tags['name:en']?.trim());
}

function isPoiTagged(tags: Record<string, string>): boolean {
  return POI_TAG_KEYS.some((k) => !!tags[k]?.trim());
}

function slimTags(tags: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of KEEP_TAG_KEYS) {
    const v = tags[key]?.trim();
    if (v) out[key] = v;
  }
  return out;
}

function matchesFilters(tags: Record<string, string>, filters: OsmTagFilter[]): boolean {
  return filters.some((f) => tags[f.key] === f.value);
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Stream Geofabrik PBF and write named POI nodes to NDJSON index.
 * Node-centric (ways need a second pass for centers — Overpass covers those when needed).
 */
export async function buildGeofabrikPoiIndex(
  paths: GeofabrikPaths = resolveGeofabrikPaths(),
): Promise<GeofabrikIndexMeta> {
  if (!fs.existsSync(paths.pbfPath)) {
    throw new Error(`Geofabrik PBF missing at ${paths.pbfPath} — run download first`);
  }

  fs.mkdirSync(paths.dir, { recursive: true });
  const partial = `${paths.indexPath}.partial`;
  const out = fs.createWriteStream(partial, { encoding: 'utf8' });
  let count = 0;

  logger.info('Geofabrik POI index build started', { pbf: paths.pbfPath });

  const stream = createOSMStream(paths.pbfPath, {
    withTags: {
      node: [...KEEP_TAG_KEYS],
      way: false,
      relation: false,
    },
    withInfo: false,
  });

  for await (const item of stream) {
    const ent = item as {
      type?: string;
      id?: number;
      lat?: number;
      lon?: number;
      tags?: Record<string, string>;
    };
    if (ent.type !== 'node') continue;
    if (typeof ent.id !== 'number' || ent.lat == null || ent.lon == null) continue;
    const tags = ent.tags ?? {};
    if (!hasName(tags) || !isPoiTagged(tags)) continue;

    const poi: IndexedOsmPoi = {
      id: ent.id,
      type: 'node',
      lat: ent.lat,
      lon: ent.lon,
      tags: slimTags(tags),
    };
    if (!out.write(`${JSON.stringify(poi)}\n`)) {
      await new Promise<void>((resolve) => out.once('drain', () => resolve()));
    }
    count++;
    if (count % 25_000 === 0) {
      logger.info('Geofabrik POI index progress', { count });
    }
  }

  await new Promise<void>((resolve, reject) => {
    out.end(() => resolve());
    out.on('error', reject);
  });

  fs.renameSync(partial, paths.indexPath);

  const meta: GeofabrikIndexMeta = {
    extractId: GEOFABRIK_EXTRACT_ID,
    pbfPath: paths.pbfPath,
    indexPath: paths.indexPath,
    builtAt: new Date().toISOString(),
    count,
  };
  fs.writeFileSync(paths.metaPath, JSON.stringify(meta, null, 2), 'utf8');

  logger.info('Geofabrik POI index build complete', { count, index: paths.indexPath });
  return meta;
}

export function readGeofabrikIndexMeta(
  paths: GeofabrikPaths = resolveGeofabrikPaths(),
): GeofabrikIndexMeta | null {
  if (!fs.existsSync(paths.metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(paths.metaPath, 'utf8')) as GeofabrikIndexMeta;
  } catch {
    return null;
  }
}

/**
 * Query local NDJSON POI index by industry tags + radius around a point.
 */
export async function queryGeofabrikPoiIndex(opts: {
  lat: number;
  lon: number;
  radiusMeters: number;
  filters: OsmTagFilter[];
  limit: number;
  paths?: GeofabrikPaths;
}): Promise<OsmElement[]> {
  const paths = opts.paths ?? resolveGeofabrikPaths();
  if (!fs.existsSync(paths.indexPath)) return [];

  const rl = readline.createInterface({
    input: fs.createReadStream(paths.indexPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  const scored: Array<{ el: OsmElement; dist: number }> = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    let poi: IndexedOsmPoi;
    try {
      poi = JSON.parse(line) as IndexedOsmPoi;
    } catch {
      continue;
    }
    if (!matchesFilters(poi.tags, opts.filters)) continue;
    const dist = haversineMeters(opts.lat, opts.lon, poi.lat, poi.lon);
    if (dist > opts.radiusMeters) continue;
    scored.push({
      dist,
      el: {
        type: 'node',
        id: poi.id,
        lat: poi.lat,
        lon: poi.lon,
        tags: poi.tags,
      },
    });
  }

  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, Math.max(opts.limit * 3, opts.limit)).map((s) => s.el);
}
