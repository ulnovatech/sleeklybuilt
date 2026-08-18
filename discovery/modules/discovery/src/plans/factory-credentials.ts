import { isCustomScrapeEnabled } from '@agency/config';
import { platformSettings } from '@agency/settings';
import { googleMapsEnabledInMode } from '../lib/run-profile';

export type FactoryCredentialId = 'places' | 'cse' | 'reddit';

export type FactoryCredentialCheck = {
  id: FactoryCredentialId;
  label: string;
  required: boolean;
  configured: boolean;
  ready: boolean;
  reason?: string;
};

export type FactoryCredentialHealth = {
  /** True when Places is configured and allowed in the current acquisition mode. */
  ready: boolean;
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
    reason: 'Optional overlay — add CSE API key and CX, or Bing, when you want public search',
  };
}

export async function getFactoryCredentialHealth(): Promise<FactoryCredentialHealth> {
  await platformSettings.ensureLoaded();
  const mode = platformSettings.getAcquisitionMode();
  const mapsAllowed = googleMapsEnabledInMode(mode);
  const placesConfigured = platformSettings.isPlacesConfigured();

  const places: FactoryCredentialCheck = {
    id: 'places',
    label: 'Google Places (factory required)',
    required: true,
    configured: placesConfigured,
    ready: placesConfigured && mapsAllowed,
    reason: !placesConfigured
      ? 'Add Google Places API key in Settings → API credentials'
      : !mapsAllowed
        ? `Places disabled in ${mode} mode — set acquisition mode to standard or boost`
        : 'Primary harvest source for Factory A/B',
  };

  const cse = classifyCseCredential(
    platformSettings.getCredential('google_cse_api_key'),
    platformSettings.getCredential('google_cse_cx'),
  );
  const cseCheck: FactoryCredentialCheck = {
    id: 'cse',
    label: 'Google Custom Search (optional overlay)',
    required: false,
    configured: cse.configured,
    ready: cse.ready,
    reason: cse.reason,
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
    ready: places.ready,
    checks: [places, cseCheck, reddit],
  };
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
