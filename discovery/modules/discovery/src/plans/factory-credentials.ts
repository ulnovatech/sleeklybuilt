import { isCustomScrapeEnabled } from '@agency/config';
import { platformSettings } from '@agency/settings';
import { googleMapsEnabledInMode } from '../lib/run-profile';
import {
  getPlacesLifecycle,
  googleCircuitReason,
  isGoogleAcquisitionDisabledByEnv,
  isGoogleCircuitOpen,
  type PlacesLifecycle,
} from '../providers/google-circuit';
import { isMetaPagesSearchReady } from '../providers/meta/meta-pages-search-gate';
import { geofabrikExtractStatus } from '../providers/osm/geofabrik-refresh';

/**
 * Plan B / survival factory sources when Google Places is dormant.
 * social_search is included for YouTube-only ingest (FACTORY_FILTERS.socialSearch = youtube).
 */
export function survivalDiscoverySources(): string[] {
  return ['openstreetmap', 'public_search', 'facebook', 'social_search', 'csv_import'];
}

export type FactoryCredentialId = 'places' | 'osm' | 'search' | 'meta' | 'reddit';

export type FactoryCredentialCheck = {
  id: FactoryCredentialId;
  label: string;
  required: boolean;
  configured: boolean;
  ready: boolean;
  reason?: string;
  /** Places-only: active vs dormant for operator badges */
  lifecycle?: PlacesLifecycle;
};

export type FactoryCredentialHealth = {
  /** True when at least one primary harvest channel is ready (Places or survival stack). */
  ready: boolean;
  /** True when Places is not harvest-ready but Plan B / survival channels are. */
  survivalMode: boolean;
  /** Google Places lifecycle — dormant means intact but not calling the API. */
  placesLifecycle: PlacesLifecycle;
  checks: FactoryCredentialCheck[];
};

export function classifyCseCredential(
  apiKey: string | undefined,
  cx: string | undefined,
): Pick<FactoryCredentialCheck, 'configured' | 'ready' | 'reason'> {
  const key = apiKey?.trim();
  const engine = cx?.trim();
  if (key && engine) {
    return { configured: true, ready: true };
  }
  if (engine && !key) {
    return {
      configured: false,
      ready: false,
      reason: 'CX is set — add Google CSE API key in Settings to enable search overlay',
    };
  }
  if (key && !engine) {
    return {
      configured: false,
      ready: false,
      reason: 'CSE API key is set — add Search engine ID (CX) in Settings',
    };
  }
  return {
    configured: false,
    ready: false,
    reason: 'Optional — add Brave Search (recommended) or CSE when you want public web search',
  };
}

/** Places usable for harvest (key present, mode allows, circuit not open). */
export function isPlacesHarvestReady(): boolean {
  if (isGoogleAcquisitionDisabledByEnv() || isGoogleCircuitOpen('places')) return false;
  const mode = platformSettings.getAcquisitionMode();
  if (!googleMapsEnabledInMode(mode)) return false;
  return platformSettings.isPlacesConfigured();
}

export function isOsmDiscoveryEnabled(): boolean {
  const osmOn = process.env.OSM_DISCOVERY_ENABLED?.trim().toLowerCase();
  return !(osmOn === '0' || osmOn === 'false' || osmOn === 'no');
}

/** Plan B harvest can run without Places — OSM alone is enough for factory ready. */
export function isSurvivalHarvestReady(): boolean {
  const brave = !!platformSettings.getCredential('brave_search_key')?.trim();
  const legacyBing =
    process.env.BING_SEARCH_LEGACY_ENABLED?.trim().toLowerCase() === 'true' ||
    process.env.BING_SEARCH_LEGACY_ENABLED?.trim() === '1';
  const bing =
    legacyBing && !!platformSettings.getCredential('bing_search_key')?.trim();
  const cse =
    !!platformSettings.getCredential('google_cse_api_key')?.trim() &&
    !!platformSettings.getCredential('google_cse_cx')?.trim() &&
    !isGoogleCircuitOpen('cse');
  const metaToken = !!platformSettings.getCredential('meta_graph_api_token')?.trim();
  const meta = metaToken && isMetaPagesSearchReady();
  return isOsmDiscoveryEnabled() || brave || bing || cse || meta;
}

export async function getFactoryCredentialHealth(): Promise<FactoryCredentialHealth> {
  await platformSettings.ensureLoaded();
  const mode = platformSettings.getAcquisitionMode();
  const mapsAllowed = googleMapsEnabledInMode(mode);
  const placesConfigured = platformSettings.isPlacesConfigured();
  const placesReady = isPlacesHarvestReady();
  const survivalReady = isSurvivalHarvestReady();
  const placesLifecycle = getPlacesLifecycle();
  const survivalMode = !placesReady && survivalReady;

  const places: FactoryCredentialCheck = {
    id: 'places',
    label: 'Google Places',
    required: false,
    configured: placesConfigured && placesLifecycle === 'active',
    ready: placesReady,
    lifecycle: placesLifecycle,
    reason:
      placesLifecycle === 'dormant'
        ? googleCircuitReason('places') ??
          'DORMANT — Places code intact; Plan B (OSM / search / Meta / CSV) harvests until billing is restored'
        : !placesConfigured
          ? 'Optional — OSM covers harvest while Google billing is down'
          : !mapsAllowed
            ? `Places disabled in ${mode} mode`
            : 'ACTIVE — primary harvest when billing is healthy',
  };

  const osmEnabled = isOsmDiscoveryEnabled();
  const extract = geofabrikExtractStatus();
  const osm: FactoryCredentialCheck = {
    id: 'osm',
    label: 'OpenStreetMap (free)',
    required: !placesReady,
    configured: osmEnabled,
    ready: osmEnabled,
    reason: !osmEnabled
      ? 'Enable OSM_DISCOVERY_ENABLED (default on)'
      : extract.summary,
  };

  const brave = !!platformSettings.getCredential('brave_search_key')?.trim();
  const legacyBing =
    process.env.BING_SEARCH_LEGACY_ENABLED?.trim().toLowerCase() === 'true' ||
    process.env.BING_SEARCH_LEGACY_ENABLED?.trim() === '1';
  const bing =
    legacyBing && !!platformSettings.getCredential('bing_search_key')?.trim();
  const cse = classifyCseCredential(
    platformSettings.getCredential('google_cse_api_key'),
    platformSettings.getCredential('google_cse_cx'),
  );
  const searchReady = brave || bing || (cse.ready && !isGoogleCircuitOpen('cse'));
  const searchCheck: FactoryCredentialCheck = {
    id: 'search',
    label: 'Public search (Brave / CSE)',
    required: false,
    configured: brave || bing || cse.configured,
    ready: searchReady,
    reason: brave
      ? 'Brave Search configured — Plan B web/YouTube ingest without Google billing'
      : bing
        ? 'Legacy Bing enabled (retired API) — prefer Brave Search'
        : isGoogleCircuitOpen('cse')
          ? 'CSE dormant with Places — add Brave Search key for web/YouTube ingest'
          : cse.reason,
  };

  const metaToken = !!platformSettings.getCredential('meta_graph_api_token')?.trim();
  const metaPagesReady = isMetaPagesSearchReady();
  const metaReady = metaToken && metaPagesReady;
  const meta: FactoryCredentialCheck = {
    id: 'meta',
    label: 'Meta Graph (Facebook / Instagram)',
    required: false,
    configured: metaToken,
    ready: metaReady,
    reason: !metaToken
      ? 'Optional — add META_GRAPH_API_TOKEN for Pages Search yield'
      : !metaPagesReady
        ? 'Token present — Pages Search not ready (run pnpm discovery:meta-probe / App Review)'
        : 'Pages Search ready — Plan B Facebook/Instagram ingest',
  };

  const redditOn = isCustomScrapeEnabled();
  const reddit: FactoryCredentialCheck = {
    id: 'reddit',
    label: 'Reddit demand (overlay)',
    required: false,
    configured: redditOn,
    ready: redditOn,
    reason: redditOn
      ? 'CUSTOM_SCRAPE_ENABLED — demand signals, not the morning 100'
      : 'Set CUSTOM_SCRAPE_ENABLED=true to poll Reddit demand',
  };

  return {
    ready: placesReady || survivalReady,
    survivalMode,
    placesLifecycle,
    checks: [places, osm, searchCheck, meta, reddit],
  };
}

export function factorySourcesForSeed(placesReady: boolean): string[] {
  if (placesReady) {
    return ['google_maps', 'openstreetmap', 'public_search', 'facebook', 'social_search'];
  }
  return survivalDiscoverySources();
}

/**
 * True when a factory plan's sources should be rewritten to the current seed list
 * (Places dormant without OSM/social_search, or Places-only legacy plans).
 */
export function factoryPlanNeedsSourceHeal(
  currentSources: string[],
  placesReady: boolean,
): boolean {
  if (currentSources.length === 0) return true;
  if (placesReady) {
    return currentSources.length === 1 && currentSources[0] === 'google_maps';
  }
  return (
    !currentSources.includes('openstreetmap') ||
    !currentSources.includes('social_search') ||
    (currentSources.includes('google_maps') && !currentSources.includes('openstreetmap'))
  );
}

/** True when factory filters still allow TikTok/all social instead of YouTube-only. */
export function factoryPlanNeedsFilterHeal(filters: unknown): boolean {
  if (filters == null || typeof filters !== 'object') return true;
  const socialSearch = (filters as { socialSearch?: unknown }).socialSearch;
  return socialSearch !== 'youtube';
}

/** Copy CSE CX from env into Settings when the DB has no CX yet. */
export async function syncFactoryCredentialFallbacks(): Promise<{ cseCxPersisted: boolean }> {
  await platformSettings.ensureLoaded();
  const envCx = process.env.GOOGLE_CSE_CX?.trim();
  const dbCx = platformSettings.getSync().credentials.google_cse_cx?.trim();
  if (!envCx || dbCx) return { cseCxPersisted: false };
  await platformSettings.updateCredentials({ google_cse_cx: envCx });
  return { cseCxPersisted: true };
}
