import { attachDiscoveryEvidence } from '@agency/validation';
import { classifyWebsiteClass } from '../../lib/website-class';
import type { DiscoveredBusiness, DiscoverySearchParams } from '../types';
import type { OsmElement } from './overpass-client';

export type OsmBackend = 'geofabrik_pbf' | 'overpass';

export function pickOsmPhone(tags: Record<string, string>): string | undefined {
  return (
    tags.phone?.trim() ||
    tags['contact:phone']?.trim() ||
    tags['contact:mobile']?.trim() ||
    tags.mobile?.trim() ||
    undefined
  );
}

export function pickOsmWebsite(tags: Record<string, string>): string | undefined {
  const raw =
    tags.website?.trim() ||
    tags['contact:website']?.trim() ||
    tags.url?.trim() ||
    undefined;
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function osmElementToBusiness(
  el: OsmElement,
  params: DiscoverySearchParams,
  backend: OsmBackend,
  extractMeta?: { extractId?: string; extractPath?: string },
): DiscoveredBusiness | null {
  const tags = el.tags ?? {};
  const name = tags.name?.trim() || tags['name:en']?.trim();
  if (!name) return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  const osmType = el.type;
  const externalId = `osm:${osmType}/${el.id}`;
  const phone = pickOsmPhone(tags);
  const website = pickOsmWebsite(tags);

  return attachDiscoveryEvidence(
    {
      name,
      industry: params.industry,
      website,
      phone,
      city: params.city,
      country: params.country,
      source: 'openstreetmap',
      sourceUrl: `https://www.openstreetmap.org/${osmType}/${el.id}`,
      externalId,
      metadata: {
        osmId: el.id,
        osmType,
        lat,
        lon,
        osmTags: tags,
        survivalSource: true,
        osmBackend: backend,
        websiteClass: classifyWebsiteClass(website),
        ...(extractMeta?.extractId ? { osmExtract: extractMeta.extractId } : {}),
        ...(extractMeta?.extractPath ? { osmExtractPath: extractMeta.extractPath } : {}),
      },
    },
    {
      phone: { method: 'osm_tags.phone', backend, confidence: 'high' },
      website: { method: 'osm_tags.website', backend, confidence: 'medium' },
    },
  );
}
