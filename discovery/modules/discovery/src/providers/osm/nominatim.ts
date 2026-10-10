import { logger } from '@agency/config';

export type GeoPoint = { lat: number; lon: number; displayName?: string };

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT =
  process.env.OSM_USER_AGENT?.trim() ||
  'SleeklyBuiltDiscovery/1.0 (+https://sleeklybuilt.com; discovery harvest)';

let lastNominatimAt = 0;

async function throttleNominatim(): Promise<void> {
  const gap = 1100;
  const wait = lastNominatimAt + gap - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastNominatimAt = Date.now();
}

/**
 * Geocode city + country via Nominatim (OSM). Free; 1 req/sec policy.
 */
export async function geocodeCityCountry(
  city: string,
  country: string,
): Promise<GeoPoint | null> {
  const q = `${city.trim()}, ${country.trim()}`;
  await throttleNominatim();

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!res.ok) {
    logger.warn('Nominatim geocode failed', { status: res.status, q });
    return null;
  }

  const data = (await res.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
  const row = data[0];
  if (!row?.lat || !row?.lon) return null;

  return {
    lat: Number(row.lat),
    lon: Number(row.lon),
    displayName: row.display_name,
  };
}
