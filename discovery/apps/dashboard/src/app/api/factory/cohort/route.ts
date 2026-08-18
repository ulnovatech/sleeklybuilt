import {
  calendarDateInTimezone,
  FACTORY_TIMEZONE,
  FactoryCohortRepository,
  FactoryScoreboardService,
  type FactoryScoreboard,
  type FactoryYieldRow,
} from '@agency/discovery';
import { getDb, intentSignals } from '@agency/database';
import { and, count, eq, isNull } from 'drizzle-orm';
import { ensureFrozenKeepersReady } from '@/lib/factory-purify';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export type FactoryCohortApiResponse = {
  sellDate: string;
  harvestDate: string | null;
  status: 'missing' | 'purifying' | 'frozen' | 'failed';
  keeperCount: number;
  dumpsterCount: number;
  frozenAt: string | null;
  errorMessage: string | null;
  fallback: {
    id: string;
    sellDate: string;
    harvestDate: string;
    keeperCount: number;
  } | null;
  scoreboard: FactoryScoreboard;
  yield: FactoryYieldRow[];
  demandOpen: number;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requested = searchParams.get('sellDate');
    const sellDate =
      requested && /^\d{4}-\d{2}-\d{2}$/.test(requested)
        ? requested
        : calendarDateInTimezone(new Date(), FACTORY_TIMEZONE);

    const repo = new FactoryCohortRepository();
    let cohort = await repo.getBySellDate(sellDate);
    if (cohort?.status === 'frozen') {
      await ensureFrozenKeepersReady(sellDate);
      cohort = await repo.getBySellDate(sellDate);
    }
    const fallbackRow = cohort?.fallbackCohortId ? await repo.getById(cohort.fallbackCohortId) : null;
    const [{ scoreboard, yield: yieldRows }, demandOpen] = await Promise.all([
      new FactoryScoreboardService().snapshot(cohort),
      countOpenDemand(),
    ]);

    const body: FactoryCohortApiResponse = {
      sellDate,
      harvestDate: cohort?.harvestDate ?? null,
      status:
        cohort?.status === 'frozen' || cohort?.status === 'failed' || cohort?.status === 'purifying'
          ? cohort.status
          : 'missing',
      keeperCount: cohort?.keeperCount ?? 0,
      dumpsterCount: cohort?.dumpsterCount ?? 0,
      frozenAt: cohort?.frozenAt?.toISOString() ?? null,
      errorMessage: cohort?.errorMessage ?? null,
      fallback: fallbackRow
        ? {
            id: fallbackRow.id,
            sellDate: fallbackRow.sellDate,
            harvestDate: fallbackRow.harvestDate,
            keeperCount: fallbackRow.keeperCount,
          }
        : null,
      scoreboard,
      yield: yieldRows,
      demandOpen,
    };
    return NextResponse.json(body);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function countOpenDemand() {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(intentSignals)
    .where(
      and(
        eq(intentSignals.signalClass, 'demand'),
        isNull(intentSignals.businessId),
        isNull(intentSignals.dismissedAt),
      ),
    );
  return Number(row?.value ?? 0);
}
