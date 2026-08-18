import { JobRepository } from '@agency/acquisition';
import { getDb, businesses, leadScores, websiteAnalyses, accounts } from '@agency/database';
import { hasRealWebsite, isLinkInBioWebsite } from '@agency/scoring';
import { platformSettings } from '@agency/settings';
import { eq } from 'drizzle-orm';
import {
  businessRowToProspectShape,
  countHighPotentialEstimate,
  countProspectCandidates,
} from './lib/prospect-metrics';
import { prospectVerifyBoost } from './providers/places/needs-verify';
import { DiscoveryPlanRepository } from './plans/plan-repository';
import { DiscoveryRepository } from './repository';
import type { DiscoveredBusiness } from './providers/types';

export type DiscoveryRunStats = {
  updatedAt: string;
  prospectFocus: boolean;
  candidatesDiscovered: number;
  prospectCandidates: number;
  highPotentialEstimate: number;
  prospectSaved: number;
  discoverBySource: Record<string, number>;
  accountsSaved: number;
  savedBySource: Record<string, number>;
  suppressedSkipped: number;
  withEmail: number;
  withPhone: number;
  contactable: number;
  withWebsite: number;
  withRealWebsite: number;
  greenfieldSaved: number;
  redesignSaved: number;
  crawled: number;
  scored: number;
  scoredAtOrAboveMin: number;
  reachabilityMediumOrHigh: number;
  contactablePct: number | null;
  websitePct: number | null;
  scoredPct: number | null;
  /** C2 incremental quality */
  newAccounts: number;
  knownFresh: number;
  knownStale: number;
  skippedEnrichment: number;
  rejected: number;
  qualified: number;
  highOpportunity: number;
  avgScore: number | null;
  estimatedOutreachDays: number | null;
};

const DEFAULT_MIN_SCORE = 25;
const HIGH_OPPORTUNITY_SCORE = 70;
const OUTREACH_PER_DAY = 20;

function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export function countBySource(items: Array<{ source: string }>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.source] = (counts[item.source] ?? 0) + 1;
  }
  return counts;
}

function readDiscoverCandidates(payload: unknown): DiscoveredBusiness[] {
  if (!payload || typeof payload !== 'object') return [];
  const candidates = (payload as { candidates?: DiscoveredBusiness[] }).candidates;
  return Array.isArray(candidates) ? candidates : [];
}

function readResolveCounts(payload: unknown): {
  suppressedSkipped: number;
  newAccounts: number;
  knownFresh: number;
  knownStale: number;
} {
  const p = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  return {
    suppressedSkipped: typeof p.suppressedSkipped === 'number' ? p.suppressedSkipped : 0,
    newAccounts: typeof p.newAccounts === 'number' ? p.newAccounts : 0,
    knownFresh: typeof p.knownFresh === 'number' ? p.knownFresh : 0,
    knownStale: typeof p.knownStale === 'number' ? p.knownStale : 0,
  };
}

export async function computeRunYieldStats(runId: string): Promise<DiscoveryRunStats> {
  await platformSettings.ensureLoaded();
  const minScore =
    platformSettings.getPlacesRunSettings().detailsMinScore ?? DEFAULT_MIN_SCORE;

  const repo = new DiscoveryRepository();
  const run = await repo.getRun(runId);

  const db = getDb();
  const jobRepo = new JobRepository();
  const jobs = await jobRepo.findByRunId(runId);

  const discoverJob = jobs.find((j) => j.stage === 'discover' && j.status === 'completed');
  const candidates = readDiscoverCandidates(discoverJob?.payload);
  const resolveJob = jobs.find((j) => j.stage === 'resolve_accounts' && j.status === 'completed');
  const resolveCounts = readResolveCounts(resolveJob?.payload);

  const crawlJob = jobs.find((j) => j.stage === 'crawl' && j.status === 'completed');
  const biJob = jobs.find((j) => j.stage === 'bi_enrich' && j.status === 'completed');
  const crawlSkipped =
    typeof (crawlJob?.payload as { skippedFresh?: number } | null)?.skippedFresh === 'number'
      ? (crawlJob!.payload as { skippedFresh: number }).skippedFresh
      : 0;
  const biSkipped =
    typeof (biJob?.payload as { skippedFresh?: number } | null)?.skippedFresh === 'number'
      ? (biJob!.payload as { skippedFresh: number }).skippedFresh
      : 0;

  const rows = await db
    .select({
      business: businesses,
      score: leadScores.score,
      reachability: leadScores.reachability,
      hasWebsite: websiteAnalyses.hasWebsite,
      crawlStatus: accounts.crawlStatus,
      analysisNotes: websiteAnalyses.notes,
    })
    .from(businesses)
    .leftJoin(leadScores, eq(leadScores.businessId, businesses.id))
    .leftJoin(websiteAnalyses, eq(websiteAnalyses.businessId, businesses.id))
    .leftJoin(accounts, eq(accounts.id, businesses.accountId))
    .where(eq(businesses.discoveryRunId, runId));

  let withEmail = 0;
  let withPhone = 0;
  let withWebsite = 0;
  let withRealWebsite = 0;
  let greenfieldSaved = 0;
  let redesignSaved = 0;
  let crawled = 0;
  let scored = 0;
  let scoredAtOrAboveMin = 0;
  let reachabilityMediumOrHigh = 0;
  let newAccounts = 0;
  let knownFresh = 0;
  let knownStale = 0;
  let highOpportunity = 0;
  let scoreSum = 0;

  const savedBySource = countBySource(rows.map((r) => r.business));

  for (const row of rows) {
    const b = row.business;
    if (b.discoveryState === 'new') newAccounts++;
    else if (b.discoveryState === 'known_fresh') knownFresh++;
    else if (b.discoveryState === 'known_stale') knownStale++;

    if (b.email?.trim()) withEmail++;
    if (b.phone?.trim()) withPhone++;
    if (b.website?.trim()) withWebsite++;
    const realWebsite = hasRealWebsite({
      hasWebsite: Boolean(b.website?.trim()),
      website: b.website,
      resolvedWebsiteFromBio: isLinkInBioWebsite(b.website ?? '') ? null : b.website,
    });
    if (realWebsite) {
      withRealWebsite++;
      redesignSaved++;
    } else {
      greenfieldSaved++;
    }
    const skippedFreshCrawl = row.analysisNotes === 'skipped_known_fresh';
    if (row.crawlStatus && row.crawlStatus !== 'skipped' && !skippedFreshCrawl) crawled++;
    if (row.score != null) {
      scored++;
      scoreSum += row.score;
      if (row.score >= minScore) scoredAtOrAboveMin++;
      if (row.score >= HIGH_OPPORTUNITY_SCORE) highOpportunity++;
    }
    if (row.reachability === 'medium' || row.reachability === 'high') {
      reachabilityMediumOrHigh++;
    }
  }

  // Prefer row-derived counts; fall back to resolve payload when older runs lack discoveryState.
  if (newAccounts + knownFresh + knownStale === 0) {
    newAccounts = resolveCounts.newAccounts;
    knownFresh = resolveCounts.knownFresh;
    knownStale = resolveCounts.knownStale;
  }

  const accountsSaved = rows.length;
  const contactable = rows.filter((r) => r.business.email?.trim() || r.business.phone?.trim()).length;
  const prospectSaved = rows.filter(
    (r) => prospectVerifyBoost(businessRowToProspectShape(r.business)) > 0,
  ).length;
  const skippedEnrichment = Math.max(knownFresh, crawlSkipped, biSkipped);
  const rejected = Math.max(
    0,
    candidates.length - accountsSaved - resolveCounts.suppressedSkipped,
  );
  const qualified = scoredAtOrAboveMin;
  const avgScore = scored > 0 ? Math.round((scoreSum / scored) * 10) / 10 : null;
  const estimatedOutreachDays =
    qualified > 0 ? Math.max(1, Math.ceil(qualified / OUTREACH_PER_DAY)) : null;

  return {
    updatedAt: new Date().toISOString(),
    prospectFocus: run?.prospectFocus ?? false,
    candidatesDiscovered: candidates.length,
    prospectCandidates: countProspectCandidates(candidates),
    highPotentialEstimate: countHighPotentialEstimate(candidates),
    prospectSaved,
    discoverBySource: countBySource(candidates),
    accountsSaved,
    savedBySource,
    suppressedSkipped: resolveCounts.suppressedSkipped,
    withEmail,
    withPhone,
    contactable,
    withWebsite,
    withRealWebsite,
    greenfieldSaved,
    redesignSaved,
    crawled,
    scored,
    scoredAtOrAboveMin,
    reachabilityMediumOrHigh,
    contactablePct: pct(contactable, accountsSaved),
    websitePct: pct(withWebsite, accountsSaved),
    scoredPct: pct(scored, accountsSaved),
    newAccounts,
    knownFresh,
    knownStale,
    skippedEnrichment,
    rejected,
    qualified,
    highOpportunity,
    avgScore,
    estimatedOutreachDays,
  };
}

export async function refreshRunYieldStats(runId: string): Promise<DiscoveryRunStats> {
  const stats = await computeRunYieldStats(runId);
  const repo = new DiscoveryRepository();
  await repo.updateRunStats(runId, stats as unknown as Record<string, unknown>);

  const run = await repo.getRun(runId);
  if (run?.planTargetId) {
    const planRepo = new DiscoveryPlanRepository();
    const target = await planRepo.getTarget(run.planTargetId);
    const prevYield = (target?.lastYield ?? {}) as { emptyStreak?: number };
    const previousStreak = Number(prevYield.emptyStreak) || 0;
    const empty =
      (stats.qualified ?? 0) === 0 &&
      (stats.highOpportunity ?? 0) === 0 &&
      (stats.newAccounts ?? 0) === 0;
    const emptyStreak = empty ? previousStreak + 1 : 0;

    const outcomeBoost = (target?.wonCount ?? 0) - (target?.lostCount ?? 0);
    const yieldScore =
      stats.qualified +
      stats.highOpportunity * 2 +
      Math.max(0, stats.newAccounts) +
      outcomeBoost;

    await planRepo.updateTargetYield(
      run.planTargetId,
      { ...(stats as unknown as Record<string, unknown>), emptyStreak },
      yieldScore,
    );

    const EMPTY_RUN_SUPPRESS_AFTER = 3;
    const EMPTY_RUN_COOLDOWN_DAYS = 7;
    if (emptyStreak >= EMPTY_RUN_SUPPRESS_AFTER) {
      const until = new Date(Date.now() + EMPTY_RUN_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
      await planRepo.suppressTarget(
        run.planTargetId,
        until,
        `${emptyStreak} consecutive empty runs`,
      );
    } else if (!empty && target?.suppressedUntil) {
      await planRepo.clearTargetSuppression(run.planTargetId);
    }
  }

  return stats;
}
