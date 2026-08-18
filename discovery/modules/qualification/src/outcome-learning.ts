import {
  accounts,
  businesses,
  discoveryPlanTargets,
  getDb,
  leadOutcomes,
  segmentPerformance,
} from '@agency/database';
import {
  SEGMENT_BASELINE_FALLBACK,
  SEGMENT_MIN_SAMPLE,
  computeSegmentAdjustment,
  derivePresenceClassFromBiHints,
  derivePrimaryGap,
  formatSegmentRecordLabel,
  parseSegmentKey,
  segmentKeyFor,
  type PresenceClass,
} from '@agency/scoring';
import { eq, inArray } from 'drizzle-orm';
import { IntelligenceService } from '@agency/intelligence';

export type SegmentPerformanceRow = typeof segmentPerformance.$inferSelect;

type OutcomeAgg = {
  won: number;
  lost: number;
  valueSum: number;
  valueCount: number;
  daysSum: number;
  daysCount: number;
  industry: string;
  city: string;
  presenceClass: string;
  primaryGap: string;
};

/**
 * Nightly (or on-demand) rebuild of segment_performance from lead_outcomes.
 * Also backfills segment_key on outcomes and rolls won/lost onto plan targets by city×industry.
 */
export async function refreshSegmentPerformance(): Promise<{
  segments: number;
  outcomes: number;
  targetsUpdated: number;
}> {
  const db = getDb();
  const intelligence = new IntelligenceService();

  const outcomes = await db
    .select()
    .from(leadOutcomes)
    .where(inArray(leadOutcomes.outcomeStatus, ['closed_won', 'closed_lost']));

  const accountIds = [
    ...new Set(outcomes.map((o) => o.accountId).filter((id): id is string => !!id)),
  ];
  const accountRows =
    accountIds.length > 0
      ? await db.select().from(accounts).where(inArray(accounts.id, accountIds))
      : [];
  const accountById = new Map(accountRows.map((a) => [a.id, a]));

  const businessRows =
    accountIds.length > 0
      ? await db
          .select()
          .from(businesses)
          .where(inArray(businesses.accountId, accountIds))
      : [];
  const businessByAccount = new Map<string, (typeof businessRows)[0]>();
  for (const b of businessRows) {
    if (!b.accountId) continue;
    const prev = businessByAccount.get(b.accountId);
    if (!prev || (b.createdAt?.getTime?.() ?? 0) > (prev.createdAt?.getTime?.() ?? 0)) {
      businessByAccount.set(b.accountId, b);
    }
  }

  const aggs = new Map<string, OutcomeAgg>();
  let globalWon = 0;
  let globalLost = 0;

  for (const outcome of outcomes) {
    const account = outcome.accountId ? accountById.get(outcome.accountId) : undefined;
    const raw = (outcome.raw ?? {}) as Record<string, unknown>;
    const industry =
      account?.industry ||
      (typeof raw.industry === 'string' ? raw.industry : null) ||
      'unknown';
    const city =
      account?.city ||
      (typeof raw.location === 'string' ? raw.location : null) ||
      'unknown';

    let presenceClass: PresenceClass = 'unknown';
    let primaryGap = 'none';
    const business = outcome.accountId ? businessByAccount.get(outcome.accountId) : undefined;
    if (business) {
      const biRow = await intelligence.getBiProfileByBusinessId(business.id);
      const profile = biRow?.profile as
        | {
            presence?: { hasWebsite?: boolean };
            digitalFootprint?: {
              socialLinks?: unknown[];
              linkInBioPages?: unknown[];
            };
            opportunityIntelligence?: { digitalGaps?: Array<{ id: string }> };
          }
        | null
        | undefined;
      const hasWebsite = profile?.presence?.hasWebsite ?? !!business.website;
      const socialOnly =
        !hasWebsite && (profile?.digitalFootprint?.socialLinks?.length ?? 0) > 0;
      const linkInBio = (profile?.digitalFootprint?.linkInBioPages?.length ?? 0) > 0;
      presenceClass = derivePresenceClassFromBiHints({
        hasWebsite,
        socialOnlyPresence: socialOnly,
        linktreeOnly: linkInBio && !hasWebsite,
      });
      primaryGap = derivePrimaryGap({
        digitalGapIds: profile?.opportunityIntelligence?.digitalGaps?.map((g) => g.id),
      });
    }

    const key =
      outcome.segmentKey ||
      segmentKeyFor({ industry, city, presenceClass, primaryGap });

    if (!outcome.segmentKey || outcome.segmentKey !== key) {
      await db
        .update(leadOutcomes)
        .set({ segmentKey: key, updatedAt: new Date() })
        .where(eq(leadOutcomes.id, outcome.id));
    }

    const parts = parseSegmentKey(key);
    const bucket =
      aggs.get(key) ??
      ({
        won: 0,
        lost: 0,
        valueSum: 0,
        valueCount: 0,
        daysSum: 0,
        daysCount: 0,
        industry: parts.industry,
        city: parts.city,
        presenceClass: parts.presenceClass,
        primaryGap: parts.primaryGap,
      } satisfies OutcomeAgg);

    const isWon = outcome.outcomeStatus === 'closed_won';
    if (isWon) {
      bucket.won += 1;
      globalWon += 1;
    } else {
      bucket.lost += 1;
      globalLost += 1;
    }

    if (outcome.projectValueUgx != null) {
      bucket.valueSum += outcome.projectValueUgx;
      bucket.valueCount += 1;
    }
    if (outcome.closedAt && outcome.createdAt) {
      // Prefer closed_at vs lead/account created when available — use outcome created as proxy open.
      const days =
        (outcome.closedAt.getTime() - outcome.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (Number.isFinite(days) && days >= 0) {
        bucket.daysSum += days;
        bucket.daysCount += 1;
      }
    }

    aggs.set(key, bucket);
  }

  const globalSample = globalWon + globalLost;
  const baseline =
    globalSample >= SEGMENT_MIN_SAMPLE
      ? globalWon / globalSample
      : SEGMENT_BASELINE_FALLBACK;

  const now = new Date();
  for (const [key, bucket] of aggs) {
    const sampleSize = bucket.won + bucket.lost;
    const winRate = sampleSize > 0 ? bucket.won / sampleSize : 0;
    const adjustment =
      sampleSize >= SEGMENT_MIN_SAMPLE
        ? computeSegmentAdjustment(winRate, baseline)
        : 0;
    const label = formatSegmentRecordLabel({
      won: bucket.won,
      lost: bucket.lost,
      industry: bucket.industry,
      city: bucket.city,
      presenceClass: bucket.presenceClass,
    });

    const values = {
      industry: bucket.industry,
      city: bucket.city,
      presenceClass: bucket.presenceClass,
      primaryGap: bucket.primaryGap,
      wonCount: bucket.won,
      lostCount: bucket.lost,
      sampleSize,
      winRate,
      avgProjectValueUgx: bucket.valueCount ? bucket.valueSum / bucket.valueCount : null,
      avgDaysToClose: bucket.daysCount ? bucket.daysSum / bucket.daysCount : null,
      adjustment,
      label,
      refreshedAt: now,
    };

    const [existing] = await db
      .select()
      .from(segmentPerformance)
      .where(eq(segmentPerformance.segmentKey, key))
      .limit(1);

    if (existing) {
      await db
        .update(segmentPerformance)
        .set(values)
        .where(eq(segmentPerformance.id, existing.id));
    } else {
      await db.insert(segmentPerformance).values({
        segmentKey: key,
        ...values,
      });
    }
  }

  const targetsUpdated = await rollupTargetOutcomeCounts();

  return {
    segments: aggs.size,
    outcomes: outcomes.length,
    targetsUpdated,
  };
}

/** Lookup segment adjustment for scoring (null when under-sampled). */
export async function getSegmentPerformanceForKey(
  segmentKey: string,
): Promise<SegmentPerformanceRow | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(segmentPerformance)
    .where(eq(segmentPerformance.segmentKey, segmentKey))
    .limit(1);
  return row ?? null;
}

export async function resolveSegmentForBusiness(input: {
  industry?: string | null;
  city?: string | null;
  presenceClass?: PresenceClass | string | null;
  primaryGap?: string | null;
}): Promise<{
  segmentKey: string;
  performance: SegmentPerformanceRow | null;
  adjustment: number;
  evidence: string | null;
}> {
  const segmentKey = segmentKeyFor(input);
  const performance = await getSegmentPerformanceForKey(segmentKey);
  const eligible = performance && performance.sampleSize >= SEGMENT_MIN_SAMPLE;
  return {
    segmentKey,
    performance,
    adjustment: eligible ? performance!.adjustment : 0,
    evidence: eligible ? performance!.label : null,
  };
}

/**
 * Roll won/lost onto discovery_plan_targets by case-insensitive city + industry match.
 */
async function rollupTargetOutcomeCounts(): Promise<number> {
  const db = getDb();
  const outcomes = await db
    .select({
      status: leadOutcomes.outcomeStatus,
      industry: accounts.industry,
      city: accounts.city,
    })
    .from(leadOutcomes)
    .leftJoin(accounts, eq(leadOutcomes.accountId, accounts.id))
    .where(inArray(leadOutcomes.outcomeStatus, ['closed_won', 'closed_lost']));

  const counts = new Map<string, { won: number; lost: number }>();
  for (const row of outcomes) {
    const industry = (row.industry ?? '').trim().toLowerCase();
    const city = (row.city ?? '').trim().toLowerCase();
    if (!industry || !city) continue;
    const k = `${city}||${industry}`;
    const bucket = counts.get(k) ?? { won: 0, lost: 0 };
    if (row.status === 'closed_won') bucket.won += 1;
    else bucket.lost += 1;
    counts.set(k, bucket);
  }

  if (counts.size === 0) return 0;

  const targets = await db.select().from(discoveryPlanTargets);
  let updated = 0;
  for (const target of targets) {
    const k = `${target.city.trim().toLowerCase()}||${target.industry.trim().toLowerCase()}`;
    const bucket = counts.get(k);
    if (!bucket) continue;
    if (target.wonCount === bucket.won && target.lostCount === bucket.lost) continue;
    await db
      .update(discoveryPlanTargets)
      .set({ wonCount: bucket.won, lostCount: bucket.lost })
      .where(eq(discoveryPlanTargets.id, target.id));
    updated += 1;
  }
  return updated;
}

/** Exposed for tests / ops diagnostics. */
export function computeEmptyRunStreak(
  previousStreak: number,
  stats: { qualified?: number; highOpportunity?: number; newAccounts?: number },
): number {
  const empty =
    (stats.qualified ?? 0) === 0 &&
    (stats.highOpportunity ?? 0) === 0 &&
    (stats.newAccounts ?? 0) === 0;
  return empty ? previousStreak + 1 : 0;
}
