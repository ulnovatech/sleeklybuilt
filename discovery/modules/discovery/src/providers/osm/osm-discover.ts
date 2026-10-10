import {
  discoveryTargetCandidates,
  logger,
} from '@agency/config';
import { platformSettings } from '@agency/settings';
import { keepOnMorningPath } from '../../lib/website-class';
import type { DiscoveredBusiness, DiscoveryProvider, DiscoverySearchParams } from '../types';
import {
  geofabrikIndexReady,
  GEOFABRIK_EXTRACT_ID,
  resolveGeofabrikPaths,
} from './geofabrik-paths';
import { queryGeofabrikPoiIndex, readGeofabrikIndexMeta } from './geofabrik-index';
import { osmTagsForIndustry } from './industry-tags';
import { osmElementToBusiness, type OsmBackend } from './map-osm-result';
import { geocodeCityCountry } from './nominatim';
import { buildAroundQuery, runOverpassQuery } from './overpass-client';

function isOsmEnabled(): boolean {
  const v = process.env.OSM_DISCOVERY_ENABLED?.trim().toLowerCase();
  if (v === '0' || v === 'false' || v === 'no') return false;
  return true; // default on — free Places stand-in
}

function radiusMeters(mode: string): number {
  if (mode === 'boost') return 12_000;
  if (mode === 'economy') return 5_000;
  return 8_000;
}

/** Prefer local Geofabrik index; set OSM_FORCE_OVERPASS=true to skip extract. */
export function preferGeofabrikExtract(): boolean {
  const force = process.env.OSM_FORCE_OVERPASS?.trim().toLowerCase();
  if (force === '1' || force === 'true' || force === 'yes') return false;
  return geofabrikIndexReady();
}

export type OsmDiscoverResult = {
  businesses: DiscoveredBusiness[];
  queriesRun: number;
  geocoded: boolean;
  backend: OsmBackend | 'none';
};

/**
 * Free OpenStreetMap discovery — Places stand-in when Google billing is down.
 * Prefer Geofabrik Uganda local extract; Overpass is fallback when extract absent.
 */
export class OsmDiscoveryProvider implements DiscoveryProvider {
  readonly name = 'openstreetmap' as const;
  readonly label = 'OpenStreetMap (Geofabrik / Overpass)';

  async isConfigured(): Promise<boolean> {
    return isOsmEnabled();
  }

  async discover(params: DiscoverySearchParams): Promise<DiscoveredBusiness[]> {
    const result = await this.discoverWithStats(params);
    return result.businesses;
  }

  async discoverWithStats(params: DiscoverySearchParams): Promise<OsmDiscoverResult> {
    if (!(await this.isConfigured())) {
      return { businesses: [], queriesRun: 0, geocoded: false, backend: 'none' };
    }

    await platformSettings.ensureLoaded();
    const mode = params.acquisitionMode ?? platformSettings.getAcquisitionMode();
    const target = discoveryTargetCandidates();
    const filters = osmTagsForIndustry(params.industry);
    const radius = radiusMeters(mode);

    const point = await geocodeCityCountry(params.city, params.country);
    if (!point) {
      logger.warn('OSM discovery skipped — geocode miss', {
        city: params.city,
        country: params.country,
      });
      return { businesses: [], queriesRun: 0, geocoded: false, backend: 'none' };
    }

    if (preferGeofabrikExtract()) {
      const paths = resolveGeofabrikPaths();
      const meta = readGeofabrikIndexMeta(paths);
      logger.info('OSM Geofabrik extract discovery started', {
        city: params.city,
        country: params.country,
        industry: params.industry,
        filterCount: filters.length,
        radius,
        target,
        index: paths.indexPath,
        extractCount: meta?.count,
      });

      const elements = await queryGeofabrikPoiIndex({
        lat: point.lat,
        lon: point.lon,
        radiusMeters: radius,
        filters,
        limit: target,
        paths,
      });

      const businesses = mapElements(elements, params, 'geofabrik_pbf', {
        extractId: meta?.extractId ?? GEOFABRIK_EXTRACT_ID,
        extractPath: paths.indexPath,
      }, target);

      logger.info('OSM Geofabrik extract discovery complete', {
        raw: elements.length,
        kept: businesses.length,
        withPhone: businesses.filter((b) => b.phone).length,
      });

      if (businesses.length > 0) {
        return { businesses, queriesRun: 1, geocoded: true, backend: 'geofabrik_pbf' };
      }

      logger.info('OSM Geofabrik extract empty for query — falling back to Overpass (ways + nodes)');
    }

    logger.info('OSM Overpass discovery started', {
      city: params.city,
      country: params.country,
      industry: params.industry,
      filterCount: filters.length,
      radius,
      target,
      hint: preferGeofabrikExtract()
        ? undefined
        : 'Run pnpm discovery:osm-geofabrik to download Uganda extract + build POI index',
    });

    const query = buildAroundQuery(filters, point.lat, point.lon, radius);
    const elements = await runOverpassQuery(query);
    const businesses = mapElements(elements, params, 'overpass', undefined, target);

    logger.info('OSM Overpass discovery complete', {
      raw: elements.length,
      kept: businesses.length,
      withPhone: businesses.filter((b) => b.phone).length,
    });

    return { businesses, queriesRun: 1, geocoded: true, backend: 'overpass' };
  }
}

function mapElements(
  elements: Parameters<typeof osmElementToBusiness>[0][],
  params: DiscoverySearchParams,
  backend: OsmBackend,
  extractMeta: { extractId?: string; extractPath?: string } | undefined,
  target: number,
): DiscoveredBusiness[] {
  const seen = new Set<string>();
  const businesses: DiscoveredBusiness[] = [];

  for (const el of elements) {
    if (businesses.length >= target) break;
    const mapped = osmElementToBusiness(el, params, backend, extractMeta);
    if (!mapped?.externalId) continue;
    if (seen.has(mapped.externalId)) continue;
    if (params.dropRealWebsites && !keepOnMorningPath(mapped)) continue;
    seen.add(mapped.externalId);
    businesses.push(mapped);
  }

  businesses.sort((a, b) => Number(!!b.phone) - Number(!!a.phone));
  return businesses;
}
