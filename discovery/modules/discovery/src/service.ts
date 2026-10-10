import { AccountRepository, AccountService } from '@agency/accounts';
import { BudgetGovernor } from '@agency/acquisition';
import { discoverProviderTimeoutMs, logger, withTimeout } from '@agency/config';
import { isTestFixtureCountry } from '@agency/database';
import { platformSettings } from '@agency/settings';
import { mergeAccountMetadata } from '@agency/validation';
import { DiscoveryRepository } from './repository';
import { classifyDiscoveryState } from './lib/discovery-state';
import { ensureDiscoverySettings, profileToMode, type RunProfile } from './lib/run-profile';
import { isGoogleCircuitOpen } from './providers/google-circuit';
import { getConfiguredDiscoveryProviders } from './providers/registry';
import { placesIdFromExternalId } from './providers/places/place-to-candidate';
import { GooglePlacesVerifyProvider } from './providers/places/places-verify';
import type { DiscoveredBusiness } from './providers/types';
import { keepOnMorningPath } from './lib/website-class';
import { DiscoveryPlanRepository } from './plans/plan-repository';
import { resolveMorningPath } from './plans/harvest-cohort';
import type { PlanSocialSearch } from './plans/types';

function dedupeBusinesses(items: DiscoveredBusiness[]): DiscoveredBusiness[] {
  const seen = new Set<string>();
  const seenPlaces = new Set<string>();

  return items.filter((b) => {
    const placesId =
      placesIdFromExternalId(b.externalId) ??
      (typeof b.metadata?.placesId === 'string' ? b.metadata.placesId : undefined);

    if (placesId) {
      if (seenPlaces.has(placesId)) return false;
      seenPlaces.add(placesId);
      return true;
    }

    const key = b.externalId ?? `${b.name}|${b.city}|${b.country}|${b.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type CreateRunParams = {
  country: string;
  city: string;
  industry: string;
  profile?: RunProfile;
  prospectFocus?: boolean;
  boiNarrative?: boolean;
  planId?: string;
  planTargetId?: string;
  trigger?: 'manual' | 'plan' | 'cron';
  /** Monitor plans re-check known accounts — no discovery providers required. */
  allowWithoutProviders?: boolean;
  harvestDate?: string | null;
  sellDate?: string | null;
  dropRealWebsites?: boolean;
};

const MONITOR_SEED_LIMIT = 40;

export class DiscoveryService {
  private repo = new DiscoveryRepository();
  private accounts = new AccountService();
  private placesVerify = new GooglePlacesVerifyProvider();

  async prepareRun(params: CreateRunParams) {
    if (isTestFixtureCountry(params.country)) {
      throw new Error('Invalid discovery target — test fixture countries are not allowed.');
    }
    await ensureDiscoverySettings();
    const profile = params.profile ?? 'standard';
    const mode = profileToMode(profile);
    if (!params.allowWithoutProviders) {
      const providers = await getConfiguredDiscoveryProviders(mode);
      if (providers.length === 0) {
        throw new Error(
          'No discovery sources are configured. Add Google Places, search credentials, Meta Graph token, or a CSV import file in Settings.',
        );
      }
    }
    return this.repo.createRun({
      country: params.country,
      city: params.city,
      industry: params.industry,
      runProfile: profile,
      prospectFocus: params.prospectFocus ?? false,
      boiNarrative: params.boiNarrative ?? false,
      planId: params.planId,
      planTargetId: params.planTargetId,
      trigger: params.trigger ?? 'manual',
      harvestDate: params.harvestDate ?? null,
      sellDate: params.sellDate ?? null,
      dropRealWebsites: params.dropRealWebsites ?? false,
    });
  }

  /**
   * Clone known accounts into a monitor run so crawl → BI → score has work
   * without a discover stage. Forces known_stale so enrichment is not skipped.
   */
  async seedMonitorRun(runId: string, limit = MONITOR_SEED_LIMIT) {
    const run = await this.repo.getRun(runId);
    if (!run) throw new Error('Discovery run not found');

    const accountRepo = new AccountRepository();
    const rows = await accountRepo.listForMonitorSeed({
      country: run.country,
      city: run.city,
      industry: run.industry,
      limit,
    });

    if (rows.length === 0) {
      throw new Error(
        `Monitor seed found no known accounts for ${run.city}, ${run.country} · ${run.industry}. Run a discovery plan for this segment first.`,
      );
    }

    const items = rows.map((a) => ({
      name: a.canonicalName,
      industry: a.industry ?? run.industry,
      website: a.website ?? undefined,
      phone: a.phone ?? undefined,
      email: a.email ?? undefined,
      city: a.city ?? run.city,
      country: a.country ?? run.country,
      source: 'manual' as const,
      sourceUrl: a.sourceUrl ?? undefined,
      externalId: a.externalId ?? undefined,
      googleMapsUrl: a.googleMapsUrl ?? undefined,
      facebookUrl: a.facebookUrl ?? undefined,
      instagramUrl: a.instagramUrl ?? undefined,
      rating: a.rating ?? undefined,
      reviewCount: a.reviewCount ?? undefined,
      metadata: {
        ...((a.metadata as Record<string, unknown> | null) ?? {}),
        monitorSeed: true,
        accountSource: a.source,
      },
      accountId: a.id,
      discoveryState: 'known_stale' as const,
    }));

    const saved = await this.repo.insertBusinesses(runId, items);
    logger.info('Monitor run seeded from known accounts', {
      runId,
      seeded: saved.length,
      city: run.city,
      industry: run.industry,
    });
    return { seeded: saved.length, businesses: saved };
  }

  async executeDiscoverStage(runId: string): Promise<{
    candidates: DiscoveredBusiness[];
    providerStats: Array<{ provider: string; count: number; error?: string }>;
  }> {
    const run = await this.repo.getRun(runId);
    if (!run) throw new Error('Discovery run not found');

    const mode = profileToMode((run.runProfile as RunProfile) ?? 'standard');
    let allowedSources: string[] | undefined;
    let socialSearch: PlanSocialSearch = 'all';
    const dropRealWebsites = run.dropRealWebsites === true;

    if (run.planId) {
      const plan = await new DiscoveryPlanRepository().getPlan(run.planId);
      if (plan) {
        const morning = resolveMorningPath(plan);
        allowedSources = morning.sources;
        socialSearch = morning.socialSearch;
        if (socialSearch === 'off' && allowedSources) {
          allowedSources = allowedSources.filter((s) => s !== 'social_search');
        }
      }
    }

    const providers = await getConfiguredDiscoveryProviders(mode, allowedSources);
    const params = {
      country: run.country,
      city: run.city,
      industry: run.industry,
      acquisitionMode: mode,
      prospectFocus: run.prospectFocus ?? false,
      dropRealWebsites,
      socialSearch,
    };

    const allBusinesses: DiscoveredBusiness[] = [];
    const providerStats: Array<{ provider: string; count: number; error?: string }> = [];

    const providerTimeout = discoverProviderTimeoutMs();
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        const found = await withTimeout(
          provider.discover(params),
          providerTimeout,
          `${provider.name} discovery`,
        );
        return { provider: provider.name, found };
      }),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const providerName = providers[i]?.name ?? 'unknown';
      if (result.status === 'rejected') {
        const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
        logger.warn('Discovery provider failed', { runId, provider: providerName, error: message });
        providerStats.push({ provider: providerName, count: 0, error: message });
        continue;
      }
      const { found } = result.value;
      allBusinesses.push(...found);
      providerStats.push({ provider: providerName, count: found.length });
      logger.info('Discovery provider completed', { provider: providerName, count: found.length, runId });
    }

    if (providerStats.every((p) => p.count === 0) && results.some((r) => r.status === 'rejected')) {
      const firstErr = results.find((r) => r.status === 'rejected');
      throw firstErr?.status === 'rejected' ? firstErr.reason : new Error('All discovery providers failed');
    }

    const unique = dedupeBusinesses(allBusinesses);
    const droppedReal = dropRealWebsites ? unique.filter((b) => !keepOnMorningPath(b)).length : 0;
    const kept = dropRealWebsites ? unique.filter((b) => keepOnMorningPath(b)) : unique;
    if (dropRealWebsites && droppedReal > 0) {
      logger.info('Morning path dropped owned websites', { runId, droppedReal, kept: kept.length });
    }
    if (kept.length === 0) {
      const providerError = providerStats.find((p) => p.error)?.error;
      if (providerError) {
        throw new Error(providerError);
      }

      await platformSettings.ensureLoaded();
      const governor = new BudgetGovernor();
      const hasPlaces = providers.some((p) => p.name === 'google_maps');
      const hasSearch = providers.some(
        (p) => p.name === 'public_search' || p.name === 'social_search',
      );

      if (hasPlaces) {
        const placesRemaining = await governor.getRemaining('google_places');
        if (placesRemaining <= 0) {
          throw new Error(
            'Google Places monthly budget is exhausted. Run `pnpm db:reset-budget` or raise PLACES_MONTHLY_CAP in Settings, then retry.',
          );
        }
      }

      if (hasSearch) {
        const cseRemaining = await governor.getRemaining('google_cse');
        const braveRemaining = await governor.getRemaining('brave_search');
        const bingRemaining = await governor.getRemaining('bing_search');
        const hasCse = !!(
          platformSettings.getCredential('google_cse_api_key') &&
          platformSettings.getCredential('google_cse_cx') &&
          !isGoogleCircuitOpen('cse')
        );
        const hasBrave = !!platformSettings.getCredential('brave_search_key')?.trim();
        const hasBing =
          (process.env.BING_SEARCH_LEGACY_ENABLED?.trim().toLowerCase() === 'true' ||
            process.env.BING_SEARCH_LEGACY_ENABLED?.trim() === '1') &&
          !!platformSettings.getCredential('bing_search_key')?.trim();

        const anySearchBudget =
          (hasCse && cseRemaining > 0) ||
          (hasBrave && braveRemaining > 0) ||
          (hasBing && bingRemaining > 0);

        if ((hasCse || hasBrave || hasBing) && !anySearchBudget) {
          throw new Error(
            hasBrave
              ? 'Brave Search daily budget is exhausted. Raise BRAVE_DAILY_CAP in Settings or retry tomorrow.'
              : hasCse
                ? 'Google Custom Search daily budget is exhausted. Raise CSE_DAILY_CAP in Settings or retry tomorrow.'
                : 'Search daily budget is exhausted. Raise BRAVE_DAILY_CAP in Settings or retry tomorrow.',
          );
        }
      }

      if (dropRealWebsites && unique.length > 0) {
        throw new Error(
          'Discovery returned only businesses with owned websites. Morning path keeps no-site and link-in-bio listings.',
        );
      }

      throw new Error(
        'Discovery returned zero businesses. Try a narrower city (not "All cities"), a different industry, or add search/CSE credentials in Settings.',
      );
    }
    return { candidates: kept, providerStats };
  }

  async executeResolveAccountsStage(runId: string, candidates: DiscoveredBusiness[]) {
    const run = await this.repo.getRun(runId);
    if (!run) throw new Error('Discovery run not found');

    const mode = profileToMode((run.runProfile as RunProfile) ?? 'standard');
    const params = {
      country: run.country,
      city: run.city,
      industry: run.industry,
      prospectFocus: run.prospectFocus ?? false,
      dropRealWebsites: run.dropRealWebsites === true,
    };

    let unique = dedupeBusinesses(candidates);

    if (mode !== 'economy' && (await this.placesVerify.isConfigured())) {
      const verifyResult = await this.placesVerify.verifyCandidates(
        unique,
        { ...params, acquisitionMode: mode },
        runId,
      );
      unique = dedupeBusinesses(verifyResult.candidates);
      logger.info('Places verify step', { runId, ...verifyResult });
    }

    if (run.dropRealWebsites) {
      unique = unique.filter((b) => keepOnMorningPath(b));
    }

    if (unique.length === 0) {
      throw new Error(
        'Discovery returned zero businesses after verification. Try a different industry/location.',
      );
    }

    const resolved = [];
    let placesRefreshSkipped = 0;
    let suppressedSkipped = 0;
    let newAccounts = 0;
    let knownFresh = 0;
    let knownStale = 0;
    await platformSettings.ensureLoaded();
    const staleAfterDays = platformSettings.getEnrichmentStaleAfterDays();
    const now = new Date();

    for (const item of unique) {
      const { account, created, skippedPlacesRefresh } = await this.accounts.resolveOrCreate({
        ...item,
        harvestDate: run.harvestDate,
        sellDate: run.sellDate,
      });
      if (skippedPlacesRefresh) placesRefreshSkipped++;
      if (await this.accounts.isSuppressed(account)) {
        suppressedSkipped++;
        logger.info('Skipping suppressed account', { accountId: account.id, name: account.canonicalName });
        continue;
      }
      const discoveryState = classifyDiscoveryState({
        created,
        account,
        staleAfterDays,
        now,
      });
      if (discoveryState === 'new') newAccounts++;
      else if (discoveryState === 'known_fresh') knownFresh++;
      else knownStale++;

      // Persist resolve-merged provenance (incl. conflicts) on the run business row
      // so operators see it on discovery run detail without opening account JSON.
      const mergedMeta = mergeAccountMetadata(
        item.metadata,
        (account.metadata as Record<string, unknown> | null) ?? undefined,
        {
          phone: account.phone,
          website: account.website,
          email: account.email,
        },
      );
      resolved.push({
        ...item,
        accountId: account.id,
        discoveryState,
        metadata: mergedMeta ?? item.metadata,
      });
    }

    if (resolved.length === 0) {
      throw new Error(
        'Discovery returned only suppressed or duplicate accounts. Adjust filters or review suppression list.',
      );
    }

    logger.info('Account resolution complete', {
      runId,
      candidates: unique.length,
      saved: resolved.length,
      suppressedSkipped,
      placesRefreshSkipped,
      newAccounts,
      knownFresh,
      knownStale,
      staleAfterDays,
    });

    const saved = await this.repo.insertBusinesses(runId, resolved);
    return {
      businesses: saved,
      suppressedSkipped,
      candidatesAfterVerify: unique.length,
      newAccounts,
      knownFresh,
      knownStale,
    };
  }

  /** Synchronous path — kept for tests and manual invocation */
  async createAndRun(params: CreateRunParams) {
    const run = await this.prepareRun(params);
    await this.repo.updateRunStatus(run.id, 'running', { startedAt: new Date(), errorMessage: null });

    try {
      const { candidates } = await this.executeDiscoverStage(run.id);
      const { businesses } = await this.executeResolveAccountsStage(run.id, candidates);
      await this.repo.updateRunStatus(run.id, 'completed', { completedAt: new Date() });
      return { run: await this.repo.getRun(run.id), businesses };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.repo.updateRunStatus(run.id, 'failed', {
        completedAt: new Date(),
        errorMessage: message,
      });
      logger.error('Discovery run failed', { runId: run.id, error: message });
      throw err;
    }
  }

  listRuns() {
    return this.repo.listRuns();
  }

  listRunsPaged(input: Parameters<DiscoveryRepository['listRunsPaged']>[0]) {
    return this.repo.listRunsPaged(input);
  }

  getRun(id: string) {
    return this.repo.getRun(id);
  }

  listBusinesses(runId: string) {
    return this.repo.listBusinessesByRun(runId);
  }

  listBusinessesPaged(input: Parameters<DiscoveryRepository['listBusinessesByRunPaged']>[0]) {
    return this.repo.listBusinessesByRunPaged(input);
  }

  getBusiness(id: string) {
    return this.repo.getBusiness(id);
  }

  async wipeAllRuns() {
    return this.repo.wipeAllRuns();
  }

  async purgeTestFixtureRuns() {
    return this.repo.purgeTestFixtureRuns();
  }
}
