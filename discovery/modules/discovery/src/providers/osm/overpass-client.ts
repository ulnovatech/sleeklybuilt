import { logger } from '@agency/config';
import type { OsmTagFilter } from './industry-tags';

const DEFAULT_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export type OsmElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function endpoints(): string[] {
  const fromEnv = process.env.OVERPASS_URL?.trim();
  if (fromEnv) return [fromEnv, ...DEFAULT_ENDPOINTS.filter((u) => u !== fromEnv)];
  return DEFAULT_ENDPOINTS;
}

export function buildAroundQuery(
  filters: OsmTagFilter[],
  lat: number,
  lon: number,
  radiusMeters: number,
): string {
  const clauses = filters.flatMap((f) => {
    const tag = `["${f.key}"="${f.value}"]`;
    return [
      `node${tag}(around:${radiusMeters},${lat},${lon});`,
      `way${tag}(around:${radiusMeters},${lat},${lon});`,
    ];
  });
  return `[out:json][timeout:45];(${clauses.join('')});out center tags;`;
}

export async function runOverpassQuery(query: string): Promise<OsmElement[]> {
  let lastErr: string | undefined;

  for (const endpoint of endpoints()) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent':
            process.env.OSM_USER_AGENT?.trim() ||
            'SleeklyBuiltDiscovery/1.0 (+https://sleeklybuilt.com; discovery harvest)',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!res.ok) {
        lastErr = `HTTP ${res.status} from ${endpoint}`;
        logger.warn('Overpass request failed', { status: res.status, endpoint });
        continue;
      }

      const data = (await res.json()) as { elements?: OsmElement[] };
      return Array.isArray(data.elements) ? data.elements : [];
    } catch (e) {
      lastErr = String(e);
      logger.warn('Overpass request error', { endpoint, error: lastErr });
    }
  }

  throw new Error(`Overpass unavailable: ${lastErr ?? 'all endpoints failed'}`);
}
