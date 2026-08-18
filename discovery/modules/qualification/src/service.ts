import { AccountService } from '@agency/accounts';
import { getDb, leads } from '@agency/database';
import { DiscoveryRepository } from '@agency/discovery';
import { IntentService } from '@agency/intent';
import { IntelligenceService, screenWhatsAppNumber } from '@agency/intelligence';
import {
  buildWebsiteOpportunityBrief,
  biScoringInputFromProfile,
  computeLeadScore,
  deriveAcquisitionLane,
  deriveBiScoringHints,
  deriveOpportunityBrief,
  derivePresenceClassFromBiHints,
  derivePrimaryGap,
  footprintChipLabels,
  hasRealWebsite,
  isValidEmailFormat,
  type BiScoringInput,
  type Reachability,
} from '@agency/scoring';
import type { BusinessIntelligenceProfile } from '@agency/intelligence';
import { platformSettings } from '@agency/settings';
import { mapWithConcurrency, pipelineConcurrency } from '@agency/config';
import { eq } from 'drizzle-orm';
import { QualificationRepository } from './repository';
import { resolveSegmentForBusiness } from './outcome-learning';
import { queryReviewQueue, type ReviewQueueFilters } from './review-queue-query';
import { queryWorkQueueCandidates } from './work-queue-query';
import {
  buildDemandEntry,
  buildOpportunityEntry,
  type OpportunityWorkItem,
  type WorkQueueEntry,
  type WorkQueueFilters,
} from './work-queue';

export type { ReviewQueueFilters, WorkQueueFilters };
export type { VerificationFilter } from './review-verification';
export { canPromoteFromReview, isProspectVerified } from './review-verification';

type BiScoringContext = {
  biInput: BiScoringInput;
  biHints: ReturnType<typeof deriveBiScoringHints>;
  footprintChips: string[];
} | null;

export class QualificationService {
  private repo = new QualificationRepository();
  private discoveryRepo = new DiscoveryRepository();
  private intentService = new IntentService();
  private intelligenceService = new IntelligenceService();
  private accountService = new AccountService();

  private async loadBiScoringContext(businessId: string): Promise<BiScoringContext> {
    const row = await this.intelligenceService.getBiProfileByBusinessId(businessId);
    const profile = (row?.profile ?? null) as BusinessIntelligenceProfile | null;
    if (!profile) return null;

    const biInput = biScoringInputFromProfile(profile);
    return {
      biInput,
      biHints: deriveBiScoringHints(biInput),
      footprintChips: footprintChipLabels(biInput.socialPlatforms ?? []),
    };
  }

  async scoreBusiness(businessId: string, targetIndustry?: string) {
    const business = await this.discoveryRepo.getBusiness(businessId);
    if (!business) throw new Error('Business not found');

    const account = business.accountId
      ? await this.accountService.getById(business.accountId)
      : null;

    const analysis = await this.intelligenceService.getAnalysis(businessId);
    const signalStrength = await this.intentService.getStrengthByClass(businessId);
    const biContext = await this.loadBiScoringContext(businessId);

    const email = business.email || account?.email || '';
    const phone = business.phone || account?.phone || '';
    const hasEmail = !!email;
    const hasPhone = !!phone;

    let alreadyContacted = false;
    let suppressed = account?.suppressed ?? false;
    if (account) {
      alreadyContacted = !!(await getDb()
        .select({ id: leads.id })
        .from(leads)
        .where(eq(leads.accountId, account.id))
        .limit(1))[0];
      suppressed = suppressed || (await this.accountService.isSuppressed(account));
    }

    const hasWebsite = biContext
      ? hasRealWebsite(biContext.biInput)
      : (analysis?.hasWebsite ?? !!business.website);

    const settings = await platformSettings.ensureLoaded();
    const icp = settings.qualification.icp;

    const biHints = biContext?.biHints;
    const presenceClass = derivePresenceClassFromBiHints({
      hasWebsite,
      socialOnlyPresence: biHints?.socialOnlyPresence,
      linktreeOnly: biHints?.linktreeOnly,
    });
    const primaryGap = derivePrimaryGap({ biHints });
    const segment = await resolveSegmentForBusiness({
      industry: business.industry,
      city: business.city,
      presenceClass,
      primaryGap,
    });

    const result = computeLeadScore({
      hasWebsite,
      httpsEnabled: analysis?.httpsEnabled ?? null,
      mobileFriendly: analysis?.mobileFriendly ?? null,
      enrichmentSignalStrength: signalStrength.enrichment,
      demandSignalStrength: signalStrength.demand,
      hasEmail,
      hasPhone,
      emailValid: hasEmail ? isValidEmailFormat(email) : undefined,
      industryMatch: targetIndustry
        ? (business.industry?.toLowerCase().includes(targetIndustry.toLowerCase()) ?? false)
        : true,
      suppressed,
      alreadyContacted,
      requireWebsiteOpportunity: icp.requireWebsiteOpportunity,
      demandWeightMultiplier: icp.demandWeightMultiplier,
      bi: biContext?.biInput,
      segmentOutcomes: segment.adjustment || undefined,
    });

    return this.repo.upsertScore({
      businessId,
      score: result.score,
      reachability: result.reachability,
      factors: result.factors,
    });
  }

  async scoreRun(runId: string) {
    const run = await this.discoveryRepo.getRun(runId);
    const bizList = await this.discoveryRepo.listBusinessesByRun(runId);
    const concurrency = pipelineConcurrency();
    const scores = await mapWithConcurrency(bizList, concurrency, (b) =>
      this.scoreBusiness(b.id, run?.industry),
    );
    return { scored: scores.length };
  }

  /**
   * Re-score specific businesses after late pipeline enrichment (places details, review pain, browser contacts).
   */
  async rescoreBusinesses(
    runId: string,
    businessIds: string[],
  ): Promise<{ rescored: number; scoreIncreased: number }> {
    const unique = [...new Set(businessIds.filter(Boolean))];
    if (unique.length === 0) return { rescored: 0, scoreIncreased: 0 };

    const run = await this.discoveryRepo.getRun(runId);
    let scoreIncreased = 0;

    const concurrency = pipelineConcurrency();
    await mapWithConcurrency(unique, concurrency, async (businessId) => {
      const before = await this.repo.getScore(businessId);
      const after = await this.scoreBusiness(businessId, run?.industry);
      if ((after.score ?? 0) > (before?.score ?? 0)) scoreIncreased++;
      return after;
    });

    return { rescored: unique.length, scoreIncreased };
  }

  async getReviewQueue(
    filters: ReviewQueueFilters = {},
    options?: { applyPlatformDefaults?: boolean },
  ) {
    const settings = await platformSettings.ensureLoaded();
    const qual = settings.qualification;
    const applyDefaults = options?.applyPlatformDefaults !== false;

    const resolved: ReviewQueueFilters = {
      ...filters,
      minScore:
        filters.minScore ??
        (applyDefaults && qual.minScoreDefault > 0 ? qual.minScoreDefault : undefined),
      verification:
        filters.verification ??
        (applyDefaults && qual.requireContactForReview ? 'verified' : 'all'),
      minReachability:
        filters.reachability || filters.minReachability
          ? filters.minReachability
          : applyDefaults
            ? qual.icp.minReachabilityForExport
            : undefined,
    };

    const { rows, total, page, limit } = await queryReviewQueue(resolved);

    const items = await Promise.all(
      rows.map(async (row) => {
        const counts = await this.intentService.getSignalCounts(row.businessId);
        const email = row.businessEmail || row.accountEmail;
        const phone = row.businessPhone || row.accountPhone;
        const factors = row.factors ?? {};
        const biContext = await this.loadBiScoringContext(row.businessId);
        const hasWebsite = biContext
          ? hasRealWebsite(biContext.biInput)
          : !!row.businessWebsite;
        const opportunity = deriveOpportunityBrief({
          factors,
          hasWebsite,
          demandSignalCount: counts.demand,
          bi: biContext?.biHints,
          footprintPlatforms: biContext?.biInput.socialPlatforms,
        });
        const acquisitionLane = deriveAcquisitionLane({
          hasRealWebsite: hasWebsite,
          opportunityType: opportunity.opportunityType,
        });

        return {
          business: {
            id: row.businessId,
            name: row.businessName,
            city: row.businessCity,
            country: row.businessCountry,
            website: row.businessWebsite,
            email,
            phone,
          },
          whatsapp: screenWhatsAppNumber(phone, null, row.businessCountry),
          account: { id: row.accountId },
          run: { id: row.runId, industry: row.runIndustry, city: row.runCity },
          score: row.score,
          reachability: (row.reachability as Reachability) ?? 'none',
          factors,
          verified: row.verified,
          listSuppressed: row.listSuppressed,
          demandSignalCount: counts.demand,
          enrichmentSignalCount: counts.enrichment,
          opportunityType: opportunity.opportunityType,
          acquisitionLane,
          opportunityTypeLabel: opportunity.opportunityTypeLabel,
          pitchAngle: opportunity.pitchAngle,
          positiveFactors: opportunity.positiveFactors,
          blockers: opportunity.blockers,
          footprintChips: biContext?.footprintChips ?? [],
        };
      }),
    );

    return { queue: items, total, page, limit };
  }

  async getOpportunityBrief(businessId: string) {
    const business = await this.discoveryRepo.getBusiness(businessId);
    if (!business) throw new Error('Business not found');

    const account = business.accountId
      ? await this.accountService.getById(business.accountId)
      : null;
    const analysis = await this.intelligenceService.getAnalysis(businessId);
    const scoreRow = await this.repo.getScore(businessId);
    const signals = await this.intentService.listByBusiness(businessId);
    const signalCounts = await this.intentService.getSignalCounts(businessId);
    const biContext = await this.loadBiScoringContext(businessId);

    const factors =
      (scoreRow?.factors as Record<string, number> | undefined) ??
      (
        await this.scoreBusiness(
          businessId,
          business.industry ?? undefined,
        )
      ).factors;

    const hasWebsite = biContext
      ? hasRealWebsite(biContext.biInput)
      : (analysis?.hasWebsite ?? !!business.website);

    const presenceClass = derivePresenceClassFromBiHints({
      hasWebsite,
      socialOnlyPresence: biContext?.biHints.socialOnlyPresence,
      linktreeOnly: biContext?.biHints.linktreeOnly,
    });
    const primaryGap = derivePrimaryGap({ biHints: biContext?.biHints });
    const segment = await resolveSegmentForBusiness({
      industry: business.industry,
      city: business.city,
      presenceClass,
      primaryGap,
    });

    const demandSnippets = signals
      .filter((s) => s.signalClass === 'demand')
      .sort((a, b) => b.signalStrength - a.signalStrength)
      .map((s) => ({
        id: s.id,
        title: s.title,
        snippet: s.snippet,
        signalStrength: s.signalStrength,
        source: s.source,
      }));

    return buildWebsiteOpportunityBrief({
      factors,
      hasWebsite,
      demandSignalCount: signalCounts.demand,
      bi: biContext?.biHints,
      footprintPlatforms: biContext?.biInput.socialPlatforms,
      website: business.website,
      crawlStatus: account?.crawlStatus ?? null,
      score: scoreRow?.score ?? undefined,
      reachability: scoreRow?.reachability ?? undefined,
      footprintChips: biContext?.footprintChips,
      segmentEvidence: segment.evidence,
      analysis: analysis
        ? {
            hasWebsite: analysis.hasWebsite,
            httpsEnabled: analysis.httpsEnabled,
            mobileFriendly: analysis.mobileFriendly,
            notes: analysis.notes,
            analyzedAt: analysis.analyzedAt?.toISOString() ?? null,
          }
        : null,
      demandSnippets,
    });
  }

  async getWorkQueue(filters: WorkQueueFilters = {}) {
    const acquisitionLane = filters.acquisitionLane ?? 'greenfield';
    const candidates = await queryWorkQueueCandidates({
      ...filters,
      acquisitionLane,
      verification: filters.verification ?? 'all',
    });

    const demandIds = candidates.rows
      .filter((row) => row.kind === 'demand' && row.demandId)
      .map((row) => row.demandId!);
    const accountIds = candidates.rows
      .filter((row) => row.kind === 'opportunity' && row.accountId)
      .map((row) => row.accountId!);

    const demandById = new Map<string, ReturnType<typeof buildDemandEntry>>();
    await Promise.all(
      demandIds.map(async (id) => {
        const signal = await this.intentService.findById(id);
        if (!signal || signal.dismissedAt) return;
        demandById.set(
          signal.id,
          buildDemandEntry({
            id: signal.id,
            source: signal.source,
            signalType: signal.signalType,
            signalStrength: signal.signalStrength,
            title: signal.title,
            snippet: signal.snippet,
            sourceUrl: signal.sourceUrl,
            capturedAt: signal.capturedAt,
          }),
        );
      }),
    );

    const opportunityByAccount = new Map<string, ReturnType<typeof buildOpportunityEntry>>();
    if (accountIds.length) {
      const { queue } = await this.getReviewQueue(
        {
          accountIds,
          verification: filters.verification ?? 'all',
          page: 1,
          limit: Math.min(100, Math.max(accountIds.length, 1)),
          q: filters.q,
          runId: filters.runId,
          minScore: filters.minScore,
          reachability: filters.reachability,
        },
        { applyPlatformDefaults: false },
      );
      let opportunities = queue as OpportunityWorkItem[];
      if (filters.opportunityType) {
        opportunities = opportunities.filter((o) => o.opportunityType === filters.opportunityType);
      }
      for (const item of opportunities) {
        opportunityByAccount.set(item.account.id, buildOpportunityEntry(item));
      }
    }

    const items: WorkQueueEntry[] = [];
    for (const row of candidates.rows) {
      if (row.kind === 'demand' && row.demandId) {
        const entry = demandById.get(row.demandId);
        if (entry) items.push(entry);
        continue;
      }
      if (row.kind === 'opportunity' && row.accountId) {
        const entry = opportunityByAccount.get(row.accountId);
        if (entry) items.push(entry);
      }
    }

    const [demandCountResult, opportunityCountResult] = await Promise.all([
      filters.kind === 'opportunity'
        ? Promise.resolve({ total: 0 })
        : queryWorkQueueCandidates({
            ...filters,
            acquisitionLane,
            kind: 'demand',
            page: 1,
            limit: 1,
            cursor: undefined,
          }),
      filters.kind === 'demand'
        ? Promise.resolve({ total: 0 })
        : queryWorkQueueCandidates({
            ...filters,
            acquisitionLane,
            kind: 'opportunity',
            page: 1,
            limit: 1,
            cursor: undefined,
          }),
    ]);

    return {
      items,
      total: candidates.total,
      page: candidates.page,
      limit: candidates.limit,
      nextCursor: candidates.nextCursor,
      hasMore: candidates.hasMore,
      /**
       * Opportunity type is derived from BI context after the page is hydrated, so it
       * narrows the loaded rows only. `total` still counts SQL-level candidates.
       */
      presenceRefined: Boolean(filters.opportunityType),
      counts: {
        demand: demandCountResult.total,
        opportunity: opportunityCountResult.total,
        verifiedOpportunity: opportunityCountResult.total,
        unverifiedOpportunity: 0,
      },
    };
  }

  async dismissFromReview(accountId: string, days = 30) {
    const account = await this.accountService.getById(accountId);
    if (!account) throw new Error('Account not found');
    const updated = await this.accountService.snoozeReview(accountId, days);
    return { accountId, snoozedUntil: updated?.reviewSnoozedUntil ?? null };
  }

  async rejectFromReview(accountId: string, reason?: string) {
    const account = await this.accountService.getById(accountId);
    if (!account) throw new Error('Account not found');
    await this.accountService.suppress(accountId, reason ?? 'Rejected from review queue');
    return { accountId, suppressed: true };
  }
}
