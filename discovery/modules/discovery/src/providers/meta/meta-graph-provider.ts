import { BudgetGovernor } from '@agency/acquisition';
import { logger } from '@agency/config';
import { platformSettings } from '@agency/settings';
import { buildMetaSearchQueries } from '../../lib/build-meta-search-queries';
import { getMetaGraphPagesPerQuery, getMetaGraphQueryLimit } from '../../lib/run-profile';
import type { DiscoveredBusiness, DiscoveryProvider, DiscoverySearchParams } from '../types';
import { MetaGraphApiError, MetaGraphClient } from './meta-graph-client';
import { mapMetaPageToDiscoveredBusiness } from './map-meta-result';
import {
  getMetaPagesSearchEnvOverride,
  isMetaPagesSearchCapabilityError,
  isMetaPagesSearchReady,
  markMetaPagesSearchGate,
  metaPagesSearchGateReason,
} from './meta-pages-search-gate';

export type MetaGraphDiscoverStats = {
  businesses: DiscoveredBusiness[];
  queriesRun: number;
  apiCalls: number;
  pagesFound: number;
  /** Always 0 — place search removed (deprecated Graph API). Kept for stats shape compatibility. */
  placesFound: number;
  capped: boolean;
  gateStatus?: 'green' | 'red' | 'skipped';
};

export class MetaGraphDiscoveryProvider implements DiscoveryProvider {
  readonly name = 'facebook' as const;
  readonly label = 'Meta Graph (Facebook + Instagram)';

  private client = new MetaGraphClient();
  private governor = new BudgetGovernor();

  /**
   * Ready when token is present and Pages Search gate is GREEN (or env override).
   * Token-only without probe remains "configured but not ready" in status UI.
   */
  async isConfigured(): Promise<boolean> {
    await platformSettings.ensureLoaded();
    if (!this.client.isConfigured()) return false;
    const env = getMetaPagesSearchEnvOverride();
    if (env === false) return false;
    if (env === true) return true;
    return isMetaPagesSearchReady();
  }

  /** Token present regardless of gate (for status / probe CLI). */
  async hasToken(): Promise<boolean> {
    await platformSettings.ensureLoaded();
    return this.client.isConfigured();
  }

  async discover(params: DiscoverySearchParams): Promise<DiscoveredBusiness[]> {
    const result = await this.discoverWithStats(params);
    return result.businesses;
  }

  async discoverWithStats(params: DiscoverySearchParams): Promise<MetaGraphDiscoverStats> {
    await platformSettings.ensureLoaded();
    if (!this.client.isConfigured()) return emptyStats('skipped');

    const env = getMetaPagesSearchEnvOverride();
    if (env === false) {
      logger.info('Meta Pages Search forced RED — skipping discover', {
        reason: metaPagesSearchGateReason(),
      });
      return emptyStats('red');
    }

    if (env !== true && !isMetaPagesSearchReady()) {
      const probe = await this.client.probePagesSearch(
        `${params.industry} ${params.city}`.trim() || 'restaurant Kampala',
      );
      if (!probe.ok) {
        logger.warn('Meta Pages Search gate RED — skipping discover', { reason: probe.reason });
        return emptyStats('red');
      }
    }

    const mode = params.acquisitionMode ?? platformSettings.getAcquisitionMode();
    const queries = buildMetaSearchQueries(params, getMetaGraphQueryLimit(mode));
    const maxPages = getMetaGraphPagesPerQuery(mode);

    const seen = new Set<string>();
    const businesses: DiscoveredBusiness[] = [];
    let apiCalls = 0;
    let queriesRun = 0;
    let pagesFound = 0;
    let capped = false;

    logger.info('Meta Pages Search discovery started', {
      queryCount: queries.length,
      maxPages,
      mode,
      gate: metaPagesSearchGateReason(),
    });

    for (const query of queries) {
      queriesRun++;

      try {
        const pageResult = await this.fetchPaged(query, maxPages, async (q, after) => {
          if (!(await this.governor.canSpend('meta_graph', 1))) {
            capped = true;
            return null;
          }
          const response = await this.client.searchPages(q, { after, limit: 25 });
          await this.governor.recordSpend({
            provider: 'meta_graph',
            operation: 'pages_search',
            units: 1,
          });
          apiCalls++;
          return response;
        });

        if (pageResult === null) break;

        for (const page of pageResult) {
          pagesFound++;
          for (const mapped of mapMetaPageToDiscoveredBusiness(page, params, query)) {
            if (!mapped.externalId || seen.has(mapped.externalId)) continue;
            seen.add(mapped.externalId);
            businesses.push(mapped);
          }
        }
      } catch (err) {
        if (err instanceof MetaGraphApiError) {
          if (isMetaPagesSearchCapabilityError(err) || err.isAuthError) {
            markMetaPagesSearchGate('red', err.message.slice(0, 180), 0);
            logger.warn('Meta Pages Search capability/auth error — gate RED', {
              message: err.message,
              code: err.code,
            });
            break;
          }
          if (err.isRateLimit) {
            logger.warn('Meta Pages Search rate limit — skipping remaining queries', {
              message: err.message,
              code: err.code,
            });
            capped = true;
            break;
          }
        }
        logger.warn('Meta Pages Search query failed', { query, error: String(err) });
      }
    }

    logger.info('Meta Pages Search discovery complete', {
      count: businesses.length,
      apiCalls,
      queriesRun,
      pagesFound,
      capped,
    });

    return {
      businesses,
      queriesRun,
      apiCalls,
      pagesFound,
      placesFound: 0,
      capped,
      gateStatus: 'green',
    };
  }

  private async fetchPaged(
    query: string,
    maxPages: number,
    fetchPage: (
      query: string,
      after?: string,
    ) => Promise<{
      data?: Array<{ id: string }>;
      paging?: { cursors?: { after?: string } };
    } | null>,
  ): Promise<Array<{ id: string }> | null> {
    const items: Array<{ id: string }> = [];
    let after: string | undefined;

    for (let page = 0; page < maxPages; page++) {
      const response = await fetchPage(query, after);
      if (response === null) return items.length > 0 ? items : null;

      const batch = response.data ?? [];
      items.push(...batch);

      const nextAfter = response.paging?.cursors?.after;
      if (!nextAfter || batch.length === 0) break;
      after = nextAfter;
    }

    return items;
  }
}

function emptyStats(gateStatus: 'green' | 'red' | 'skipped'): MetaGraphDiscoverStats {
  return {
    businesses: [],
    queriesRun: 0,
    apiCalls: 0,
    pagesFound: 0,
    placesFound: 0,
    capped: false,
    gateStatus,
  };
}
