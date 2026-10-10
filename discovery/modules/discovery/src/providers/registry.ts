import { platformSettings } from '@agency/settings';

import { CsvImportProvider } from './csv-import';
import { getCsvImportFileInfo } from '../lib/csv-import-service';
import { PublicSearchProvider } from './public-search';
import { GooglePlacesDiscoveryProvider } from './places/places-discover';
import { GooglePlacesVerifyProvider } from './places/places-verify';
import { MetaGraphDiscoveryProvider } from './meta/meta-graph-provider';
import { evaluateMetaPagesSearchCapability } from './meta/meta-pages-search-gate';
import { SocialSearchProvider } from './social/social-search-provider';
import { OsmDiscoveryProvider } from './osm/osm-discover';
import { geofabrikIndexReady } from './osm/geofabrik-paths';
import { getAcquisitionMode, googleMapsEnabledInMode } from '../lib/run-profile';
import { classifyCseCredential } from '../plans/factory-credentials';
import {
  getPlacesLifecycle,
  googleCircuitReason,
  isGoogleCircuitOpen,
} from './google-circuit';
import type { DiscoveryProvider } from './types';

const placesDiscover = new GooglePlacesDiscoveryProvider();
const osmDiscover = new OsmDiscoveryProvider();
const csvProvider = new CsvImportProvider();
const searchProvider = new PublicSearchProvider();
const metaProvider = new MetaGraphDiscoveryProvider();
const socialProvider = new SocialSearchProvider();
const placesVerify = new GooglePlacesVerifyProvider();

async function isProviderConfigured(provider: DiscoveryProvider): Promise<boolean> {
  return !!(await provider.isConfigured());
}

/**
 * Discover-stage providers in priority order:
 * 1. Google Places (standard/boost only, when circuit closed)
 * 2. OpenStreetMap (free Places stand-in)
 * 3. Public search (Brave / CSE)
 * 4. Meta Graph
 * 5. Social search
 * 6. CSV import
 */
export async function getConfiguredDiscoveryProviders(
  mode = getAcquisitionMode(),
  allowedSources?: string[],
): Promise<DiscoveryProvider[]> {
  await platformSettings.ensureLoaded();
  const ordered: DiscoveryProvider[] = [];

  if (googleMapsEnabledInMode(mode) && (await isProviderConfigured(placesDiscover))) {
    ordered.push(placesDiscover);
  }
  if (await isProviderConfigured(osmDiscover)) ordered.push(osmDiscover);
  if (await isProviderConfigured(searchProvider)) ordered.push(searchProvider);
  if (await isProviderConfigured(metaProvider)) ordered.push(metaProvider);
  if (await isProviderConfigured(socialProvider)) ordered.push(socialProvider);
  if (await isProviderConfigured(csvProvider)) ordered.push(csvProvider);

  if (!allowedSources || allowedSources.length === 0) return ordered;
  const allow = new Set(allowedSources);
  return ordered.filter((p) => allow.has(p.name));
}

export async function getDiscoveryProviderStatus(): Promise<
  Array<{
    name: string;
    label: string;
    configured: boolean;
    enabled: boolean;
    reason?: string;
    lifecycle?: 'active' | 'dormant';
  }>
> {
  await platformSettings.ensureLoaded();

  const mode = getAcquisitionMode();
  const mapsAllowed = googleMapsEnabledInMode(mode);
  const placesConfigured = await placesVerify.isConfigured();
  const placesLifecycle = getPlacesLifecycle();
  const placesDormant = placesLifecycle === 'dormant';

  const statuses = [];

  statuses.push({
    name: 'google_maps',
    label: placesDiscover.label,
    configured: placesConfigured && !placesDormant,
    enabled: placesConfigured && mapsAllowed && !placesDormant,
    lifecycle: placesLifecycle,
    reason: placesDormant
      ? googleCircuitReason('places') ??
        'DORMANT — Places provider preserved; Plan B harvests until billing is restored'
      : placesConfigured && !mapsAllowed
        ? `Disabled in ${mode} mode — use standard or boost for Places discovery`
        : placesConfigured && mapsAllowed
          ? 'ACTIVE — primary harvest when billing is healthy'
          : 'Optional when OSM/search/Meta/CSV are ready — add Places key when billing works',
  });

  const osmConfigured = await osmDiscover.isConfigured();
  const extractReady = geofabrikIndexReady();
  statuses.push({
    name: 'openstreetmap',
    label: osmDiscover.label,
    configured: osmConfigured,
    enabled: osmConfigured,
    reason: !osmConfigured
      ? 'Set OSM_DISCOVERY_ENABLED=true (default) or unset disable flag'
      : extractReady
        ? 'Geofabrik Uganda POI index — $0 local extract (Overpass if extract empty)'
        : 'Overpass + Nominatim fallback — run pnpm discovery:osm-geofabrik for local extract',
  });

  const cseStatus = classifyCseCredential(
    platformSettings.getCredential('google_cse_api_key'),
    platformSettings.getCredential('google_cse_cx'),
  );
  const cseCircuit = isGoogleCircuitOpen('cse');

  // Public search (Brave / CSE); Meta Pages Search; social site: via same search engines
  for (const p of [searchProvider, metaProvider, socialProvider]) {
    const configured = await isProviderConfigured(p);
    let reason: string | undefined;
    if (
      p === searchProvider &&
      cseCircuit &&
      !platformSettings.getCredential('brave_search_key') &&
      !(
        (process.env.BING_SEARCH_LEGACY_ENABLED?.trim().toLowerCase() === 'true' ||
          process.env.BING_SEARCH_LEGACY_ENABLED?.trim() === '1') &&
        platformSettings.getCredential('bing_search_key')
      )
    ) {
      reason =
        googleCircuitReason('cse') ??
        'Google CSE circuit open — add Brave Search key for public search without Google';
    } else if (p === metaProvider) {
      const gate = evaluateMetaPagesSearchCapability();
      reason = configured
        ? 'Facebook /pages/search (App Review required); linked Instagram when available'
        : gate.reason;
    } else if (p === socialProvider && configured) {
      reason =
        'site: social profiles via Brave/CSE — factory Plan B is YouTube-only; other platforms when plan filter allows';
    } else if (p === searchProvider && configured) {
      reason = platformSettings.getCredential('brave_search_key')
        ? 'Brave Search (+ CSE when Google circuit closed)'
        : 'Public web search via configured engines';
    } else if (p === searchProvider && !configured) {
      reason = cseCircuit
        ? 'Add Brave Search API key (Settings) — CSE dormant with Places'
        : cseStatus.reason;
    }
    statuses.push({
      name: p.name,
      label: p.label,
      configured,
      enabled: configured,
      reason,
    });
  }

  const csvInfo = getCsvImportFileInfo();
  statuses.push({
    name: csvProvider.name,
    label: csvProvider.label,
    configured: csvInfo.configured,
    enabled: csvInfo.configured,
    reason: !csvInfo.exists
      ? 'Upload a CSV file to enable import'
      : !csvInfo.valid
        ? csvInfo.validationMessage
        : `${csvInfo.rowCount} row${csvInfo.rowCount === 1 ? '' : 's'} ready`,
  });

  return statuses;
}

export function getAcquisitionModeLabel(): string {
  return getAcquisitionMode();
}

export { placesDiscover, placesVerify, osmDiscover };
