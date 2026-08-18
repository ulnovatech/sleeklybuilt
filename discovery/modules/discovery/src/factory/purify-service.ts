import { classifyMissReason } from './miss-reasons';
import { purifyTargetDates } from './purify-window';
import { cutKeepers, rankScore } from './rank';
import { hasWhatsAppHint, recommendPitchChannel } from './recommended-channel';
import {
  FactoryCohortRepository,
  type FactoryCohortRow,
  type FactoryMemberInsert,
  type HarvestPoolRow,
} from './repository';

export type PurifyInput = {
  harvestDate: string;
  sellDate: string;
  force?: boolean;
};

export type PurifyResult = {
  cohort: FactoryCohortRow;
  skipped: boolean;
  reason?: 'already_frozen' | 'empty_harvest' | 'error';
  poolSize: number;
  keeperCount: number;
  dumpsterCount: number;
  errorMessage?: string;
};

type EligibleRow = HarvestPoolRow & {
  rankScore: number;
  hasWhatsAppHint: boolean;
};

export class FactoryPurifyService {
  constructor(private repo = new FactoryCohortRepository()) {}

  async purifyForNow(now = new Date(), opts?: { force?: boolean }): Promise<PurifyResult> {
    const target = purifyTargetDates(now);
    return this.purify({ ...target, force: opts?.force });
  }

  async purify(input: PurifyInput): Promise<PurifyResult> {
    const existing = await this.repo.getBySellDate(input.sellDate);
    if (existing?.status === 'frozen' && !input.force) {
      return {
        cohort: existing,
        skipped: true,
        reason: 'already_frozen',
        poolSize: existing.keeperCount + existing.dumpsterCount,
        keeperCount: existing.keeperCount,
        dumpsterCount: existing.dumpsterCount,
      };
    }

    const fallback = await this.repo.lastFrozen(input.sellDate);
    const cohort = await this.repo.upsertCohort({
      harvestDate: input.harvestDate,
      sellDate: input.sellDate,
      status: 'purifying',
      errorMessage: null,
      fallbackCohortId: fallback?.id ?? null,
    });

    try {
      const harvest = await this.repo.loadHarvestPool(input.harvestDate);
      const exclude = new Set(harvest.map((row) => row.accountId));
      const bench = await this.repo.loadBenchPool(input.sellDate, exclude);
      const pool = [...harvest, ...bench];
      if (pool.length === 0) {
        await this.repo.replaceMembers(cohort.id, []);
        const failed = await this.repo.failCohort(
          cohort.id,
          `No morning-path harvest or bench rows for ${input.harvestDate}.`,
          fallback?.id ?? null,
        );
        return {
          cohort: failed,
          skipped: false,
          reason: 'empty_harvest',
          poolSize: 0,
          keeperCount: 0,
          dumpsterCount: 0,
          errorMessage: failed.errorMessage ?? undefined,
        };
      }

      const members = await this.buildMembers(pool);
      const keeperCount = members.filter((m) => m.role === 'keeper').length;
      const dumpsterCount = members.length - keeperCount;
      await this.repo.replaceMembers(cohort.id, members);
      const frozen = await this.repo.freezeCohort(cohort.id, {
        keeperCount,
        dumpsterCount,
        fallbackCohortId: null,
      });
      return {
        cohort: frozen,
        skipped: false,
        poolSize: pool.length,
        keeperCount,
        dumpsterCount,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const failed = await this.repo.failCohort(cohort.id, message, fallback?.id ?? null);
      return {
        cohort: failed,
        skipped: false,
        reason: 'error',
        poolSize: 0,
        keeperCount: 0,
        dumpsterCount: 0,
        errorMessage: message,
      };
    }
  }

  private async buildMembers(pool: HarvestPoolRow[]): Promise<FactoryMemberInsert[]> {
    const activeLeads = await this.repo.listActiveLeadAccountIds(pool.map((row) => row.accountId));
    const dumpster: FactoryMemberInsert[] = [];
    const eligible: EligibleRow[] = [];

    for (const row of pool) {
      const miss = classifyMissReason({
        phone: row.phone,
        website: row.website,
        metadata: row.metadata,
        suppressed: row.suppressed,
        snoozedUntil: row.snoozedUntil,
        hasActiveLead: activeLeads.has(row.accountId),
        analysisHasWebsite: row.analysisHasWebsite,
      });
      if (miss) {
        dumpster.push({
          accountId: row.accountId,
          businessId: row.businessId,
          role: 'dumpster',
          missReason: miss,
        });
        continue;
      }
      const whatsapp = hasWhatsAppHint({ website: row.website, metadata: row.metadata });
      eligible.push({
        ...row,
        hasWhatsAppHint: whatsapp,
        rankScore: rankScore({
          score: row.score,
          reviewCount: row.reviewCount,
          hasWhatsAppHint: whatsapp,
          hasDemand: row.hasDemand,
          country: row.country,
        }),
      });
    }

    const { keepers, remainder } = cutKeepers(eligible);
    const rankedKeepers: FactoryMemberInsert[] = keepers.map((row, index) => ({
      accountId: row.accountId,
      businessId: row.businessId,
      role: 'keeper',
      rank: index + 1,
      rankScore: row.rankScore,
      recommendedChannel: recommendPitchChannel({
        phone: row.phone,
        email: row.email,
        hasWhatsAppHint: row.hasWhatsAppHint,
      }),
    }));
    const overCut: FactoryMemberInsert[] = remainder.map((row, index) => ({
      accountId: row.accountId,
      businessId: row.businessId,
      role: 'dumpster',
      missReason: 'over_cut',
      rank: keepers.length + index + 1,
      rankScore: row.rankScore,
    }));
    return [...rankedKeepers, ...dumpster, ...overCut];
  }
}
