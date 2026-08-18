import { keepOnMorningPath } from '../lib/website-class';
import { DiscoveryPlanRepository } from '../plans/plan-repository';
import {
  countPitchedKeepers,
  dumpsterReasonCoverage,
  greenfieldIntegrity,
  yieldHeadline,
  type FactoryYieldRow,
} from './scoreboard';
import { FactoryCohortRepository, type FactoryCohortRow } from './repository';

export type FactoryScoreboard = {
  keepers: number;
  dumpster: number;
  pitched: number;
  unpitched: number;
  demandJumps: number;
  greenfieldPct: number | null;
  modernizeCount: number;
  dumpsterReasonPct: number | null;
  readyByFreeze: boolean;
};

export type FactoryTodaySnapshot = {
  scoreboard: FactoryScoreboard;
  yield: FactoryYieldRow[];
};

function yieldNumber(lastYield: Record<string, unknown> | null, key: string): number | null {
  if (!lastYield) return null;
  const value = lastYield[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export class FactoryScoreboardService {
  constructor(
    private cohorts = new FactoryCohortRepository(),
    private plans = new DiscoveryPlanRepository(),
  ) {}

  async snapshot(cohort: FactoryCohortRow | null): Promise<FactoryTodaySnapshot> {
    const yieldRows = await this.loadYield();
    if (!cohort) {
      return {
        scoreboard: {
          keepers: 0,
          dumpster: 0,
          pitched: 0,
          unpitched: 0,
          demandJumps: 0,
          greenfieldPct: null,
          modernizeCount: 0,
          dumpsterReasonPct: null,
          readyByFreeze: false,
        },
        yield: yieldRows,
      };
    }

    const [keeperRows, missingReason] = await Promise.all([
      this.cohorts.listKeeperScoreRows(cohort.id),
      this.cohorts.countDumpsterMissingReason(cohort.id),
    ]);

    const { pitched, unpitched } = countPitchedKeepers(keeperRows.map((row) => row.leadStatus));
    let modernizeCount = 0;
    let demandJumps = 0;
    for (const row of keeperRows) {
      const website = row.website;
      const metadata = (row.metadata ?? {}) as Record<string, unknown>;
      if (!keepOnMorningPath({ website, metadata })) modernizeCount += 1;
      if (row.caseFile && row.caseFile.demandJump === true) demandJumps += 1;
    }

    const integrity = greenfieldIntegrity(cohort.keeperCount, modernizeCount);

    return {
      scoreboard: {
        keepers: cohort.keeperCount,
        dumpster: cohort.dumpsterCount,
        pitched,
        unpitched,
        demandJumps,
        greenfieldPct: integrity.greenfieldPct,
        modernizeCount: integrity.modernizeCount,
        dumpsterReasonPct: dumpsterReasonCoverage(cohort.dumpsterCount, missingReason),
        readyByFreeze: cohort.status === 'frozen' && Boolean(cohort.frozenAt),
      },
      yield: yieldRows,
    };
  }

  private async loadYield(): Promise<FactoryYieldRow[]> {
    const rows = await this.plans.listFactoryYieldTargets(5);
    return rows
      .filter((row) => !row.suppressedUntil || row.suppressedUntil.getTime() <= Date.now())
      .map((row) => {
        const lastYield = (row.lastYield ?? {}) as Record<string, unknown>;
        const emptyStreak = yieldNumber(lastYield, 'emptyStreak') ?? 0;
        const qualified = yieldNumber(lastYield, 'qualified');
        const newAccounts = yieldNumber(lastYield, 'newAccounts');
        return {
          city: row.city,
          industry: row.industry,
          country: row.country,
          yieldScore: row.yieldScore,
          qualified,
          newAccounts,
          won: row.wonCount,
          lost: row.lostCount,
          emptyStreak,
          headline: yieldHeadline({
            city: row.city,
            industry: row.industry,
            yieldScore: row.yieldScore,
            won: row.wonCount,
            lost: row.lostCount,
            emptyStreak,
          }),
        };
      });
  }
}
