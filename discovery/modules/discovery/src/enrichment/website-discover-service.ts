/**
 * website_discover stage — prove owned website presence/absence via Brave/CSE search.
 * Missing/failed search → uncertain (never confirmed_greenfield).
 */

import { AccountRepository } from '@agency/accounts';
import { getDb, accounts, businesses } from '@agency/database';
import { logger } from '@agency/config';
import { platformSettings } from '@agency/settings';
import { eq } from 'drizzle-orm';
import {
  classifyWebsiteHit,
  isCredibleOwnedWebsiteHit,
} from '../lib/classify-website-hit';
import {
  emptyProspectProof,
  isProspectProofFresh,
  mergeProspectProofIntoMetadata,
  readProspectProof,
  type ProspectProof,
  type WebsiteHitEvidence,
  type WebsiteSearchQueryEvidence,
} from '../lib/prospect-evidence';
import {
  buildWebsiteSearchPlan,
  computeWebsiteSearchCoverage,
  planHasSufficientIdentity,
} from '../lib/website-search-contract';
import type { GreenfieldStatus } from '../lib/greenfield-status';
import { SearchApiClient } from '../providers/search-api-client';
import type { SearchResultItem } from '../providers/parse-search-results';

export type WebsiteDiscoverSearchFn = (
  query: string,
  opts: { maxPages: number; country: string },
) => Promise<{
  items: SearchResultItem[];
  budgetExhausted?: boolean;
  errors?: Array<{ message?: string; status?: number }>;
  engine?: string;
}>;

export type WebsiteDiscoverRunResult = {
  attempted: number;
  updated: number;
  confirmedGreenfield: number;
  existingWebsite: number;
  uncertain: number;
  skippedFresh: number;
  skippedUnconfigured: number;
};

const DEFAULT_MAX_CANDIDATES = 80;

export class WebsiteDiscoverService {
  private accountRepo = new AccountRepository();
  private client = new SearchApiClient({ logContext: 'website_discover', braveOperation: 'search' });

  constructor(private readonly searchFn?: WebsiteDiscoverSearchFn) {}

  async discoverForRun(
    runId: string,
    opts?: { maxCandidates?: number; force?: boolean },
  ): Promise<WebsiteDiscoverRunResult> {
    await platformSettings.ensureLoaded();
    const maxCandidates = opts?.maxCandidates ?? DEFAULT_MAX_CANDIDATES;
    const rows = await this.loadRunCandidates(runId, maxCandidates);

    const result: WebsiteDiscoverRunResult = {
      attempted: 0,
      updated: 0,
      confirmedGreenfield: 0,
      existingWebsite: 0,
      uncertain: 0,
      skippedFresh: 0,
      skippedUnconfigured: 0,
    };

    const configured = this.searchFn ? true : this.client.isConfigured();
    if (!configured) {
      for (const row of rows) {
        result.attempted++;
        // Never overwrite stronger crawl/search evidence with an unconfigured skip.
        if (row.metadata?.websiteClass === 'real' && row.website?.trim()) {
          result.skippedFresh++;
          result.existingWebsite++;
          continue;
        }
        const existing = readProspectProof(row.metadata);
        if (
          existing?.greenfieldStatus === 'existing_website' &&
          existing.ownedWebsiteUrl
        ) {
          result.skippedFresh++;
          result.existingWebsite++;
          continue;
        }
        if (
          existing?.greenfieldStatus === 'confirmed_greenfield' &&
          existing.searchCompletion === 'complete' &&
          isProspectProofFresh(existing)
        ) {
          result.skippedFresh++;
          result.confirmedGreenfield++;
          continue;
        }
        result.skippedUnconfigured++;
        result.uncertain++;
        await this.persistProof(
          row.accountId,
          emptyProspectProof(
            'uncertain',
            'Website search skipped — Brave/CSE not configured; missing data is not proof of no website',
          ),
          row.metadata,
          { searchCompletion: 'skipped' },
        );
        result.updated++;
      }
      return result;
    }

    for (const row of rows) {
      result.attempted++;
      const existing = readProspectProof(row.metadata);
      if (
        !opts?.force &&
        existing?.greenfieldStatus === 'confirmed_greenfield' &&
        existing.searchCompletion === 'complete' &&
        isProspectProofFresh(existing)
      ) {
        result.skippedFresh++;
        continue;
      }
      if (
        !opts?.force &&
        existing?.greenfieldStatus === 'existing_website' &&
        existing.ownedWebsiteUrl &&
        isProspectProofFresh(existing)
      ) {
        result.skippedFresh++;
        continue;
      }

      // Stronger crawl-proven real site already on account — do not downgrade.
      if (row.metadata?.websiteClass === 'real' && row.website?.trim()) {
        const proof = this.buildExistingWebsiteProof(row.website, 'Account already has crawl-proven owned website');
        await this.persistProof(row.accountId, proof, row.metadata, {
          website: row.website,
          websiteClass: 'real',
        });
        result.existingWebsite++;
        result.updated++;
        continue;
      }

      const proof = await this.searchOne({
        name: row.name,
        city: row.city,
        country: row.country,
        phone: row.phone,
        existingWebsite: row.website,
      });

      const patch: { website?: string; websiteClass?: string } = {};
      if (proof.greenfieldStatus === 'existing_website' && proof.ownedWebsiteUrl) {
        // Do not overwrite stronger crawl-proven class with search-uncertain.
        if (row.metadata?.websiteClass !== 'real') {
          patch.website = proof.ownedWebsiteUrl;
          patch.websiteClass = 'uncertain';
        }
        result.existingWebsite++;
      } else if (proof.greenfieldStatus === 'confirmed_greenfield') {
        result.confirmedGreenfield++;
      } else {
        result.uncertain++;
      }

      await this.persistProof(row.accountId, proof, row.metadata, patch);
      result.updated++;
    }

    logger.info('website_discover complete', { runId, ...result });
    return result;
  }

  async searchOne(input: {
    name: string;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
    existingWebsite?: string | null;
  }): Promise<ProspectProof> {
    const plan = buildWebsiteSearchPlan(input);
    if (plan.length === 0) {
      return emptyProspectProof('uncertain', 'No identity fields available to plan website search');
    }

    const queryEvidence: WebsiteSearchQueryEvidence[] = [];
    const hits: WebsiteHitEvidence[] = [];
    const country = input.country?.trim() || 'Uganda';

    for (const planned of plan) {
      try {
        const search = this.searchFn
          ? await this.searchFn(planned.query, { maxPages: 1, country })
          : await this.client.searchQuery(planned.query, { maxPages: 1, country });

        const engine =
          'engine' in search && typeof search.engine === 'string' ? search.engine : 'brave_search';

        if (search.budgetExhausted && search.items.length === 0) {
          queryEvidence.push({
            query: planned.query,
            required: planned.required,
            role: planned.role,
            outcome: 'budget_skip',
            engine,
            hitCount: 0,
          });
          continue;
        }

        if (search.errors?.length && search.items.length === 0) {
          const status = search.errors[0]?.status;
          queryEvidence.push({
            query: planned.query,
            required: planned.required,
            role: planned.role,
            outcome: status === 429 ? 'rate_limited' : status && status >= 500 ? 'timeout' : 'error',
            engine,
            hitCount: 0,
            errorMessage: search.errors[0]?.message,
          });
          continue;
        }

        queryEvidence.push({
          query: planned.query,
          required: planned.required,
          role: planned.role,
          outcome: search.items.length === 0 ? 'empty' : 'completed',
          engine,
          hitCount: search.items.length,
        });

        for (const item of search.items.slice(0, 8)) {
          const classified = classifyWebsiteHit({
            link: item.link,
            title: item.title,
            snippet: item.snippet,
            businessName: input.name,
          });
          hits.push({
            url: classified.url,
            kind: classified.kind,
            title: classified.title,
            confidence: classified.confidence,
            matchedOn: classified.matchedOn,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        queryEvidence.push({
          query: planned.query,
          required: planned.required,
          role: planned.role,
          outcome: /timeout/i.test(message) ? 'timeout' : 'error',
          errorMessage: message,
        });
      }
    }

    return this.classifyFromEvidence({
      queries: queryEvidence,
      hits,
      planIdentityOk: planHasSufficientIdentity(plan),
      existingWebsite: input.existingWebsite,
    });
  }

  classifyFromEvidence(input: {
    queries: WebsiteSearchQueryEvidence[];
    hits: WebsiteHitEvidence[];
    planIdentityOk: boolean;
    existingWebsite?: string | null;
  }): ProspectProof {
    const nowIso = new Date().toISOString();
    const coverage = computeWebsiteSearchCoverage(input.queries);

    const ownedHits = input.hits.filter((h) =>
      isCredibleOwnedWebsiteHit({
        url: h.url,
        kind: h.kind,
        confidence: h.confidence,
        matchedOn: h.matchedOn ?? [],
        title: h.title,
      }),
    );
    const ambiguousOwned = input.hits.filter(
      (h) => h.kind === 'ambiguous' && h.confidence >= 0.45,
    );

    if (ownedHits.length > 0) {
      const best = [...ownedHits].sort((a, b) => b.confidence - a.confidence)[0]!;
      return {
        version: 1,
        greenfieldStatus: 'existing_website',
        websiteSearchCoverage: coverage.coverage,
        searchCompletion: coverage.complete ? 'complete' : 'incomplete',
        websiteSearchAt: nowIso,
        classificationReason: `Credible owned website found: ${best.url}`,
        queries: input.queries,
        websiteHits: input.hits,
        contacts: [],
        ownedWebsiteUrl: best.url,
      };
    }

    if (ambiguousOwned.length > 0 || !input.planIdentityOk) {
      return {
        version: 1,
        greenfieldStatus: 'uncertain',
        websiteSearchCoverage: coverage.coverage,
        searchCompletion: coverage.complete ? 'incomplete' : coverage.requiredComplete ? 'incomplete' : 'incomplete',
        websiteSearchAt: nowIso,
        classificationReason: !input.planIdentityOk
          ? 'Identity too weak for confirmation (need name + locality)'
          : 'Ambiguous website signals — investigate further',
        conflictReason: ambiguousOwned[0] ? `Ambiguous hit: ${ambiguousOwned[0].url}` : undefined,
        queries: input.queries,
        websiteHits: input.hits,
        contacts: [],
        ownedWebsiteUrl: null,
      };
    }

    if (!coverage.complete) {
      const anyHardFail = input.queries.some((q) =>
        ['error', 'budget_skip', 'rate_limited', 'timeout', 'unconfigured'].includes(q.outcome),
      );
      return {
        version: 1,
        greenfieldStatus: 'uncertain',
        websiteSearchCoverage: coverage.coverage,
        searchCompletion: anyHardFail ? 'failed' : 'incomplete',
        websiteSearchAt: nowIso,
        classificationReason: coverage.reason,
        queries: input.queries,
        websiteHits: input.hits,
        contacts: [],
        ownedWebsiteUrl: null,
      };
    }

    // Complete search, no credible owned site — confirmed greenfield.
    return {
      version: 1,
      greenfieldStatus: 'confirmed_greenfield',
      websiteSearchCoverage: coverage.coverage,
      searchCompletion: 'complete',
      websiteSearchAt: nowIso,
      classificationReason:
        'Adequate website search completed with no credible owned business website found',
      queries: input.queries,
      websiteHits: input.hits,
      contacts: [],
      ownedWebsiteUrl: null,
    };
  }

  private buildExistingWebsiteProof(url: string, reason: string): ProspectProof {
    return {
      version: 1,
      greenfieldStatus: 'existing_website',
      websiteSearchCoverage: 1,
      searchCompletion: 'complete',
      websiteSearchAt: new Date().toISOString(),
      classificationReason: reason,
      queries: [],
      websiteHits: [{ url, kind: 'owned_site', confidence: 1, matchedOn: [] }],
      contacts: [],
      ownedWebsiteUrl: url,
    };
  }

  private async persistProof(
    accountId: string,
    proof: ProspectProof,
    priorMetadata: Record<string, unknown> | null,
    patch?: { website?: string; websiteClass?: string; searchCompletion?: ProspectProof['searchCompletion'] },
  ) {
    const nextProof =
      patch?.searchCompletion && patch.searchCompletion !== proof.searchCompletion
        ? { ...proof, searchCompletion: patch.searchCompletion }
        : proof;
    const metadata = mergeProspectProofIntoMetadata(priorMetadata, nextProof);
    if (patch?.websiteClass) metadata.websiteClass = patch.websiteClass;
    const update: { metadata: Record<string, unknown>; website?: string } = { metadata };
    if (patch?.website) update.website = patch.website;
    await this.accountRepo.update(accountId, update);
  }

  private async loadRunCandidates(
    runId: string,
    limit: number,
  ): Promise<
    Array<{
      accountId: string;
      name: string;
      website: string | null;
      phone: string | null;
      city: string | null;
      country: string | null;
      metadata: Record<string, unknown> | null;
    }>
  > {
    const db = getDb();
    const rows = await db
      .select({
        accountId: accounts.id,
        name: accounts.canonicalName,
        website: accounts.website,
        phone: accounts.phone,
        city: accounts.city,
        country: accounts.country,
        metadata: accounts.metadata,
      })
      .from(businesses)
      .innerJoin(accounts, eq(businesses.accountId, accounts.id))
      .where(eq(businesses.discoveryRunId, runId))
      .limit(limit * 2);

    // Prefer phone-present rows for factory budget.
    const sorted = [...rows].sort((a, b) => {
      const ap = a.phone?.trim() ? 1 : 0;
      const bp = b.phone?.trim() ? 1 : 0;
      return bp - ap;
    });
    const seen = new Set<string>();
    const out: typeof rows = [];
    for (const row of sorted) {
      if (seen.has(row.accountId)) continue;
      seen.add(row.accountId);
      out.push(row);
      if (out.length >= limit) break;
    }
    return out;
  }
}

export type { GreenfieldStatus };
