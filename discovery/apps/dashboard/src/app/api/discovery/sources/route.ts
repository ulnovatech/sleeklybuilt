import { BudgetGovernor } from '@agency/acquisition';
import { getAcquisitionModeLabel, getDiscoveryProviderStatus, getFactoryCredentialHealth } from '@agency/discovery';
import { IntentService } from '@agency/intent';
import { platformSettings } from '@agency/settings';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const governor = new BudgetGovernor();

export async function GET() {
  await platformSettings.ensureLoaded();
  const sources = await getDiscoveryProviderStatus();
  const factory = await getFactoryCredentialHealth();
  const customHealth = await new IntentService().customScrapeHealth();
  const customSource = {
    name: 'reddit_custom',
    label: 'Reddit demand (custom scrape)',
    configured: customHealth.enabled,
    enabled: customHealth.enabled && customHealth.status !== 'degraded',
    reason:
      !customHealth.enabled
        ? 'Set CUSTOM_SCRAPE_ENABLED=true'
        : customHealth.status === 'degraded'
          ? 'Degraded — no successful poll in 3 days'
          : customHealth.status === 'healthy'
            ? undefined
            : 'Awaiting first poll',
    health: customHealth.status,
  };
  const allSources = [...sources, customSource];
  const active = allSources.filter((s) => s.configured && s.enabled);
  const budget = await governor.getSummary();
  const places = budget.find((b) => b.provider === 'google_places');
  const cse = budget.find((b) => b.provider === 'google_cse');
  const brave = budget.find((b) => b.provider === 'brave_search');
  const mode = getAcquisitionModeLabel();
  const searchQueriesPerRun = platformSettings.getRunSearchQueryLimit();
  const searchBudgetAvailable = !!(cse?.canSpend || brave?.canSpend);

  let message: string | undefined;
  if (!factory.ready) {
    message =
      'No harvest channel ready. OpenStreetMap is on by default — keep OSM_DISCOVERY_ENABLED on, or add Brave Search / Meta / CSV. Google Places stays dormant until billing is restored.';
  } else if (factory.survivalMode || factory.placesLifecycle === 'dormant') {
    message =
      'Google Places is DORMANT (billing/circuit). Harvesting via Plan B: OpenStreetMap (+ Brave public search / Meta / social / CSV when configured). Places code remains for reactivation.';
  } else if (active.length === 0) {
    message =
      'No discovery sources active. Add Google Places, Brave Search (or CSE), Meta Graph token, OSM (default), or a CSV import file.';
  } else if (
    mode === 'economy' &&
    !searchBudgetAvailable &&
    !sources.find((s) => s.name === 'csv_import')?.configured &&
    !sources.find((s) => s.name === 'openstreetmap')?.enabled
  ) {
    message =
      'Economy mode: search budget exhausted (Brave/CSE). Use OSM, CSV import, or wait until tomorrow.';
  } else if (places && !places.canSpend && mode !== 'economy') {
    message = `Google Places monthly budget exhausted (${places.used}/${places.cap}). OSM, Brave/public search, and CSV still available.`;
  }

  return NextResponse.json({
    sources: allSources,
    ready: active.length > 0,
    factory,
    budget: {
      providers: budget,
      acquisitionMode: mode,
      searchQueriesPerRun,
    },
    message,
  });
}
