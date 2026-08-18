import {
  getDb,
  accounts,
  businesses,
  discoveryRuns,
  factoryCohortMembers,
  factoryCohorts,
  intentSignals,
  leadScores,
  leads,
  websiteAnalyses,
} from '@agency/database';
import { and, asc, count, desc, eq, ilike, inArray, isNull, lt, notInArray, or, sql, type SQL } from 'drizzle-orm';
import { BENCH_MISS_REASONS } from './dumpster';
import type { FactoryMissReason } from './miss-reasons';
import type { FactoryPitchChannel } from './recommended-channel';

const TERMINAL_LEAD_STATUSES = ['CLOSED_WON', 'CLOSED_LOST', 'ARCHIVED'] as const;

export type FactoryCohortStatus = 'purifying' | 'frozen' | 'failed';
export type FactoryMemberRole = 'keeper' | 'dumpster';

export type HarvestPoolRow = {
  businessId: string;
  accountId: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  metadata: Record<string, unknown> | null;
  suppressed: boolean;
  reviewCount: number | null;
  score: number | null;
  analysisHasWebsite: boolean;
  hasDemand: boolean;
  snoozedUntil: Date | null;
};

export type FactoryCohortRow = typeof factoryCohorts.$inferSelect;
export type FactoryMemberInsert = {
  accountId: string;
  businessId: string;
  leadId?: string | null;
  role: FactoryMemberRole;
  missReason?: FactoryMissReason | null;
  rank?: number | null;
  rankScore?: number | null;
  recommendedChannel?: FactoryPitchChannel | null;
  caseFile?: Record<string, unknown> | null;
};

export class FactoryCohortRepository {
  async getBySellDate(sellDate: string) {
    const db = getDb();
    const [row] = await db.select().from(factoryCohorts).where(eq(factoryCohorts.sellDate, sellDate)).limit(1);
    return row ?? null;
  }

  async getById(id: string) {
    const db = getDb();
    const [row] = await db.select().from(factoryCohorts).where(eq(factoryCohorts.id, id)).limit(1);
    return row ?? null;
  }

  async lastFrozen(beforeSellDate?: string) {
    const db = getDb();
    const rows = await db
      .select()
      .from(factoryCohorts)
      .where(
        beforeSellDate
          ? and(eq(factoryCohorts.status, 'frozen'), lt(factoryCohorts.sellDate, beforeSellDate))
          : eq(factoryCohorts.status, 'frozen'),
      )
      .orderBy(desc(factoryCohorts.sellDate))
      .limit(1);
    return rows[0] ?? null;
  }

  async upsertCohort(input: {
    harvestDate: string;
    sellDate: string;
    status: FactoryCohortStatus;
    errorMessage?: string | null;
    fallbackCohortId?: string | null;
  }) {
    const db = getDb();
    const existing = await this.getBySellDate(input.sellDate);
    if (existing) {
      const [row] = await db
        .update(factoryCohorts)
        .set({
          harvestDate: input.harvestDate,
          status: input.status,
          errorMessage: input.errorMessage ?? null,
          fallbackCohortId: input.fallbackCohortId ?? existing.fallbackCohortId,
          updatedAt: new Date(),
        })
        .where(eq(factoryCohorts.id, existing.id))
        .returning();
      return row!;
    }
    const [row] = await db
      .insert(factoryCohorts)
      .values({
        harvestDate: input.harvestDate,
        sellDate: input.sellDate,
        status: input.status,
        errorMessage: input.errorMessage ?? null,
        fallbackCohortId: input.fallbackCohortId ?? null,
      })
      .returning();
    return row!;
  }

  async freezeCohort(
    id: string,
    counts: { keeperCount: number; dumpsterCount: number; fallbackCohortId?: string | null },
  ) {
    const db = getDb();
    const [row] = await db
      .update(factoryCohorts)
      .set({
        status: 'frozen',
        keeperCount: counts.keeperCount,
        dumpsterCount: counts.dumpsterCount,
        errorMessage: null,
        fallbackCohortId: counts.fallbackCohortId ?? null,
        frozenAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(factoryCohorts.id, id))
      .returning();
    return row!;
  }

  async failCohort(id: string, errorMessage: string, fallbackCohortId?: string | null) {
    const db = getDb();
    const [row] = await db
      .update(factoryCohorts)
      .set({
        status: 'failed',
        errorMessage,
        fallbackCohortId: fallbackCohortId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(factoryCohorts.id, id))
      .returning();
    return row!;
  }

  async replaceMembers(cohortId: string, members: FactoryMemberInsert[]) {
    const db = getDb();
    await db.delete(factoryCohortMembers).where(eq(factoryCohortMembers.cohortId, cohortId));
    if (members.length === 0) return;
    const rows = members.map((m) => ({
      cohortId,
      accountId: m.accountId,
      businessId: m.businessId,
      leadId: m.leadId ?? null,
      role: m.role,
      missReason: m.missReason ?? null,
      rank: m.rank ?? null,
      rankScore: m.rankScore ?? null,
      recommendedChannel: m.recommendedChannel ?? null,
      caseFile: m.caseFile ?? null,
    }));
    const batchSize = 200;
    for (let i = 0; i < rows.length; i += batchSize) {
      await db.insert(factoryCohortMembers).values(rows.slice(i, i + batchSize));
    }
  }

  async listKeepers(cohortId: string) {
    const db = getDb();
    return db
      .select()
      .from(factoryCohortMembers)
      .where(and(eq(factoryCohortMembers.cohortId, cohortId), eq(factoryCohortMembers.role, 'keeper')))
      .orderBy(factoryCohortMembers.rank);
  }

  async getMember(id: string) {
    const db = getDb();
    const [row] = await db.select().from(factoryCohortMembers).where(eq(factoryCohortMembers.id, id)).limit(1);
    return row ?? null;
  }

  async getMemberByAccount(cohortId: string, accountId: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(factoryCohortMembers)
      .where(and(eq(factoryCohortMembers.cohortId, cohortId), eq(factoryCohortMembers.accountId, accountId)))
      .limit(1);
    return row ?? null;
  }

  async insertMember(cohortId: string, member: FactoryMemberInsert) {
    const db = getDb();
    const [row] = await db
      .insert(factoryCohortMembers)
      .values({
        cohortId,
        accountId: member.accountId,
        businessId: member.businessId,
        leadId: member.leadId ?? null,
        role: member.role,
        missReason: member.missReason ?? null,
        rank: member.rank ?? null,
        rankScore: member.rankScore ?? null,
        recommendedChannel: member.recommendedChannel ?? null,
        caseFile: member.caseFile ?? null,
      })
      .returning();
    return row!;
  }

  async frontKeeperRank(cohortId: string) {
    const db = getDb();
    const [row] = await db
      .select({ value: sql<number | null>`min(${factoryCohortMembers.rank})` })
      .from(factoryCohortMembers)
      .where(and(eq(factoryCohortMembers.cohortId, cohortId), eq(factoryCohortMembers.role, 'keeper')));
    const min = row?.value;
    if (min == null) return 1;
    return Number(min) - 1;
  }

  async updateMember(
    id: string,
    patch: Partial<{
      role: FactoryMemberRole;
      missReason: FactoryMissReason | null;
      rank: number | null;
      rankScore: number | null;
      recommendedChannel: FactoryPitchChannel | null;
      leadId: string | null;
      caseFile: Record<string, unknown> | null;
    }>,
  ) {
    const db = getDb();
    const [row] = await db
      .update(factoryCohortMembers)
      .set(patch)
      .where(eq(factoryCohortMembers.id, id))
      .returning();
    return row ?? null;
  }

  async recountRoles(cohortId: string) {
    const db = getDb();
    const [keepers] = await db
      .select({ value: count() })
      .from(factoryCohortMembers)
      .where(and(eq(factoryCohortMembers.cohortId, cohortId), eq(factoryCohortMembers.role, 'keeper')));
    const [dumpster] = await db
      .select({ value: count() })
      .from(factoryCohortMembers)
      .where(and(eq(factoryCohortMembers.cohortId, cohortId), eq(factoryCohortMembers.role, 'dumpster')));
    const keeperCount = Number(keepers?.value ?? 0);
    const dumpsterCount = Number(dumpster?.value ?? 0);
    const [row] = await db
      .update(factoryCohorts)
      .set({ keeperCount, dumpsterCount, updatedAt: new Date() })
      .where(eq(factoryCohorts.id, cohortId))
      .returning();
    return row!;
  }

  async nextKeeperRank(cohortId: string) {
    const db = getDb();
    const [row] = await db
      .select({ value: sql<number>`coalesce(max(${factoryCohortMembers.rank}), 0)` })
      .from(factoryCohortMembers)
      .where(and(eq(factoryCohortMembers.cohortId, cohortId), eq(factoryCohortMembers.role, 'keeper')));
    return Number(row?.value ?? 0) + 1;
  }

  async setMemberLead(memberId: string, leadId: string) {
    const db = getDb();
    await db
      .update(factoryCohortMembers)
      .set({ leadId })
      .where(eq(factoryCohortMembers.id, memberId));
  }

  async setMemberCaseFile(
    memberId: string,
    caseFile: Record<string, unknown> | null,
    recommendedChannel?: FactoryPitchChannel | null,
  ) {
    const db = getDb();
    await db
      .update(factoryCohortMembers)
      .set({
        caseFile,
        ...(recommendedChannel ? { recommendedChannel } : {}),
      })
      .where(eq(factoryCohortMembers.id, memberId));
  }

  async listActiveLeadAccountIds(accountIds: string[]) {
    if (accountIds.length === 0) return new Set<string>();
    const db = getDb();
    const found = new Set<string>();
    const chunkSize = 500;
    for (let i = 0; i < accountIds.length; i += chunkSize) {
      const chunk = accountIds.slice(i, i + chunkSize);
      const rows = await db
        .select({ accountId: leads.accountId })
        .from(leads)
        .where(and(inArray(leads.accountId, chunk), notInArray(leads.status, [...TERMINAL_LEAD_STATUSES])));
      for (const row of rows) found.add(row.accountId);
    }
    return found;
  }

  async loadHarvestPool(harvestDate: string): Promise<HarvestPoolRow[]> {
    const db = getDb();
    const rows = await db
      .select({
        businessId: businesses.id,
        accountId: businesses.accountId,
        website: sql<string | null>`coalesce(${accounts.website}, ${businesses.website})`,
        phone: sql<string | null>`coalesce(${accounts.phone}, ${businesses.phone})`,
        email: sql<string | null>`coalesce(${accounts.email}, ${businesses.email})`,
        country: sql<string | null>`coalesce(${accounts.country}, ${businesses.country})`,
        metadata: sql<Record<string, unknown> | null>`coalesce(${accounts.metadata}, ${businesses.metadata})`,
        suppressed: accounts.suppressed,
        reviewCount: accounts.reviewCount,
        score: leadScores.score,
        analysisHasWebsite: websiteAnalyses.hasWebsite,
        demandId: intentSignals.id,
        snoozedUntil: accounts.reviewSnoozedUntil,
      })
      .from(businesses)
      .innerJoin(discoveryRuns, eq(businesses.discoveryRunId, discoveryRuns.id))
      .innerJoin(accounts, eq(businesses.accountId, accounts.id))
      .leftJoin(leadScores, eq(leadScores.businessId, businesses.id))
      .leftJoin(websiteAnalyses, eq(websiteAnalyses.businessId, businesses.id))
      .leftJoin(
        intentSignals,
        and(eq(intentSignals.businessId, businesses.id), isNull(intentSignals.dismissedAt)),
      )
      .where(and(eq(discoveryRuns.harvestDate, harvestDate), eq(discoveryRuns.dropRealWebsites, true)));

    const byAccount = new Map<string, HarvestPoolRow>();
    for (const row of rows) {
      if (!row.accountId) continue;
      const hasDemand = Boolean(row.demandId);
      const existing = byAccount.get(row.accountId);
      const next: HarvestPoolRow = {
        businessId: row.businessId,
        accountId: row.accountId,
        website: row.website,
        phone: row.phone,
        email: row.email,
        country: row.country,
        metadata: row.metadata,
        suppressed: row.suppressed,
        reviewCount: row.reviewCount,
        score: row.score,
        analysisHasWebsite: Boolean(row.analysisHasWebsite),
        hasDemand: hasDemand || Boolean(existing?.hasDemand),
        snoozedUntil: row.snoozedUntil ?? null,
      };
      if (!existing || (next.score ?? 0) > (existing.score ?? 0)) {
        next.hasDemand = hasDemand || Boolean(existing?.hasDemand);
        byAccount.set(row.accountId, next);
      } else if (hasDemand) {
        existing.hasDemand = true;
      }
    }
    return [...byAccount.values()];
  }

  /**
   * Previous frozen dumpster rows that can compete again tonight (over_cut / no_phone).
   * Excludes suppressed, currently snoozed, and accounts already in today's harvest.
   */
  async loadBenchPool(beforeSellDate: string, excludeAccountIds: Set<string>): Promise<HarvestPoolRow[]> {
    const previous = await this.lastFrozen(beforeSellDate);
    if (!previous) return [];
    const db = getDb();
    const now = new Date();
    const rows = await db
      .select({
        businessId: businesses.id,
        accountId: businesses.accountId,
        website: sql<string | null>`coalesce(${accounts.website}, ${businesses.website})`,
        phone: sql<string | null>`coalesce(${accounts.phone}, ${businesses.phone})`,
        email: sql<string | null>`coalesce(${accounts.email}, ${businesses.email})`,
        country: sql<string | null>`coalesce(${accounts.country}, ${businesses.country})`,
        metadata: sql<Record<string, unknown> | null>`coalesce(${accounts.metadata}, ${businesses.metadata})`,
        suppressed: accounts.suppressed,
        reviewCount: accounts.reviewCount,
        score: leadScores.score,
        analysisHasWebsite: websiteAnalyses.hasWebsite,
        demandId: intentSignals.id,
        snoozedUntil: accounts.reviewSnoozedUntil,
      })
      .from(factoryCohortMembers)
      .innerJoin(accounts, eq(accounts.id, factoryCohortMembers.accountId))
      .innerJoin(businesses, eq(businesses.id, factoryCohortMembers.businessId))
      .leftJoin(leadScores, eq(leadScores.businessId, businesses.id))
      .leftJoin(websiteAnalyses, eq(websiteAnalyses.businessId, businesses.id))
      .leftJoin(
        intentSignals,
        and(eq(intentSignals.businessId, businesses.id), isNull(intentSignals.dismissedAt)),
      )
      .where(
        and(
          eq(factoryCohortMembers.cohortId, previous.id),
          eq(factoryCohortMembers.role, 'dumpster'),
          inArray(factoryCohortMembers.missReason, [...BENCH_MISS_REASONS]),
          eq(accounts.suppressed, false),
          or(isNull(accounts.reviewSnoozedUntil), lt(accounts.reviewSnoozedUntil, now)),
        ),
      );

    const byAccount = new Map<string, HarvestPoolRow>();
    for (const row of rows) {
      if (!row.accountId || excludeAccountIds.has(row.accountId)) continue;
      const hasDemand = Boolean(row.demandId);
      const existing = byAccount.get(row.accountId);
      const next: HarvestPoolRow = {
        businessId: row.businessId,
        accountId: row.accountId,
        website: row.website,
        phone: row.phone,
        email: row.email,
        country: row.country,
        metadata: row.metadata,
        suppressed: row.suppressed,
        reviewCount: row.reviewCount,
        score: row.score,
        analysisHasWebsite: Boolean(row.analysisHasWebsite),
        hasDemand: hasDemand || Boolean(existing?.hasDemand),
        snoozedUntil: row.snoozedUntil ?? null,
      };
      if (!existing || (next.score ?? 0) > (existing.score ?? 0)) {
        next.hasDemand = hasDemand || Boolean(existing?.hasDemand);
        byAccount.set(row.accountId, next);
      } else if (hasDemand) {
        existing.hasDemand = true;
      }
    }
    return [...byAccount.values()];
  }

  async listDumpsterPaged(input: {
    sellDate: string;
    page: number;
    limit: number;
    q?: string;
    missReason?: string;
    country?: string;
    industry?: string;
    source?: string;
    sort?: 'rankScore' | 'name' | 'missReason' | 'country';
    direction?: 'asc' | 'desc';
    includeSnoozed?: boolean;
  }) {
    const db = getDb();
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    const offset = (page - 1) * limit;
    const now = new Date();
    const conditions: SQL[] = [
      eq(factoryCohorts.sellDate, input.sellDate),
      eq(factoryCohorts.status, 'frozen'),
      eq(factoryCohortMembers.role, 'dumpster'),
    ];
    if (input.missReason) conditions.push(eq(factoryCohortMembers.missReason, input.missReason));
    if (input.country) conditions.push(eq(accounts.country, input.country));
    if (input.industry) conditions.push(eq(businesses.industry, input.industry));
    if (input.source) conditions.push(eq(businesses.source, input.source));
    if (!input.includeSnoozed && input.missReason !== 'snoozed') {
      conditions.push(or(isNull(accounts.reviewSnoozedUntil), lt(accounts.reviewSnoozedUntil, now))!);
    }
    const q = input.q?.trim();
    if (q) {
      const pattern = `%${q.replace(/[%_]/g, '\\$&')}%`;
      const textMatch = or(
        ilike(businesses.name, pattern),
        ilike(businesses.city, pattern),
        ilike(accounts.city, pattern),
        ilike(accounts.country, pattern),
        ilike(businesses.phone, pattern),
        ilike(accounts.phone, pattern),
        ilike(businesses.industry, pattern),
      );
      if (textMatch) conditions.push(textMatch);
    }
    const where = and(...conditions);
    const dir = input.direction === 'asc' ? asc : desc;
    const orderBy = (() => {
      switch (input.sort) {
        case 'name':
          return [dir(businesses.name), desc(factoryCohortMembers.id)];
        case 'country':
          return [dir(accounts.country), desc(factoryCohortMembers.rankScore), desc(factoryCohortMembers.id)];
        case 'missReason':
          return [dir(factoryCohortMembers.missReason), desc(factoryCohortMembers.rankScore), desc(factoryCohortMembers.id)];
        case 'rankScore':
        default:
          return [dir(factoryCohortMembers.rankScore), desc(factoryCohortMembers.id)];
      }
    })();

    const [totalRow] = await db
      .select({ value: count() })
      .from(factoryCohortMembers)
      .innerJoin(factoryCohorts, eq(factoryCohorts.id, factoryCohortMembers.cohortId))
      .innerJoin(accounts, eq(accounts.id, factoryCohortMembers.accountId))
      .innerJoin(businesses, eq(businesses.id, factoryCohortMembers.businessId))
      .where(where);

    const items = await db
      .select({
        memberId: factoryCohortMembers.id,
        cohortId: factoryCohortMembers.cohortId,
        accountId: factoryCohortMembers.accountId,
        businessId: factoryCohortMembers.businessId,
        leadId: factoryCohortMembers.leadId,
        missReason: factoryCohortMembers.missReason,
        rank: factoryCohortMembers.rank,
        rankScore: factoryCohortMembers.rankScore,
        recommendedChannel: factoryCohortMembers.recommendedChannel,
        name: businesses.name,
        city: sql<string | null>`coalesce(${accounts.city}, ${businesses.city})`,
        country: sql<string | null>`coalesce(${accounts.country}, ${businesses.country})`,
        industry: sql<string | null>`coalesce(${accounts.industry}, ${businesses.industry})`,
        source: businesses.source,
        phone: sql<string | null>`coalesce(${accounts.phone}, ${businesses.phone})`,
        website: sql<string | null>`coalesce(${accounts.website}, ${businesses.website})`,
        suppressed: accounts.suppressed,
        snoozedUntil: accounts.reviewSnoozedUntil,
        harvestDate: factoryCohorts.harvestDate,
        sellDate: factoryCohorts.sellDate,
      })
      .from(factoryCohortMembers)
      .innerJoin(factoryCohorts, eq(factoryCohorts.id, factoryCohortMembers.cohortId))
      .innerJoin(accounts, eq(accounts.id, factoryCohortMembers.accountId))
      .innerJoin(businesses, eq(businesses.id, factoryCohortMembers.businessId))
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const reasonRows = await db
      .select({
        missReason: factoryCohortMembers.missReason,
        value: count(),
      })
      .from(factoryCohortMembers)
      .innerJoin(factoryCohorts, eq(factoryCohorts.id, factoryCohortMembers.cohortId))
      .innerJoin(accounts, eq(accounts.id, factoryCohortMembers.accountId))
      .where(
        and(
          eq(factoryCohorts.sellDate, input.sellDate),
          eq(factoryCohorts.status, 'frozen'),
          eq(factoryCohortMembers.role, 'dumpster'),
        ),
      )
      .groupBy(factoryCohortMembers.missReason);

    const reasonCounts: Record<string, number> = {};
    for (const row of reasonRows) {
      if (row.missReason) reasonCounts[row.missReason] = Number(row.value);
    }

    return {
      items,
      total: Number(totalRow?.value ?? 0),
      page,
      limit,
      reasonCounts,
    };
  }

  async listKeeperScoreRows(cohortId: string) {
    const db = getDb();
    return db
      .select({
        memberId: factoryCohortMembers.id,
        leadStatus: leads.status,
        website: sql<string | null>`coalesce(${accounts.website}, ${businesses.website})`,
        metadata: accounts.metadata,
        caseFile: factoryCohortMembers.caseFile,
        analysisHasWebsite: websiteAnalyses.hasWebsite,
      })
      .from(factoryCohortMembers)
      .innerJoin(accounts, eq(accounts.id, factoryCohortMembers.accountId))
      .innerJoin(businesses, eq(businesses.id, factoryCohortMembers.businessId))
      .leftJoin(leads, eq(leads.id, factoryCohortMembers.leadId))
      .leftJoin(websiteAnalyses, eq(websiteAnalyses.businessId, businesses.id))
      .where(and(eq(factoryCohortMembers.cohortId, cohortId), eq(factoryCohortMembers.role, 'keeper')));
  }

  async countDumpsterMissingReason(cohortId: string) {
    const db = getDb();
    const [row] = await db
      .select({ value: count() })
      .from(factoryCohortMembers)
      .where(
        and(
          eq(factoryCohortMembers.cohortId, cohortId),
          eq(factoryCohortMembers.role, 'dumpster'),
          isNull(factoryCohortMembers.missReason),
        ),
      );
    return Number(row?.value ?? 0);
  }
}
