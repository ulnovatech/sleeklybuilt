import { calendarDateInTimezone, FactoryCohortRepository, FACTORY_TIMEZONE } from '@agency/discovery';
import { factoryDumpsterListQuerySchema, parseListSearchParams } from '@agency/validation';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = parseListSearchParams(factoryDumpsterListQuerySchema, searchParams);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const sellDate =
      parsed.data.sellDate ?? calendarDateInTimezone(new Date(), FACTORY_TIMEZONE);
    const repo = new FactoryCohortRepository();
    const cohort = await repo.getBySellDate(sellDate);
    if (!cohort || cohort.status !== 'frozen') {
      return NextResponse.json({
        items: [],
        total: 0,
        page: parsed.data.page,
        limit: parsed.data.limit,
        sellDate,
        harvestDate: cohort?.harvestDate ?? null,
        status: cohort?.status ?? 'missing',
        dumpsterCount: cohort?.dumpsterCount ?? 0,
        keeperCount: cohort?.keeperCount ?? 0,
        reasonCounts: {},
      });
    }

    const result = await repo.listDumpsterPaged({
      sellDate,
      page: parsed.data.page,
      limit: parsed.data.limit,
      q: parsed.data.q,
      missReason: parsed.data.missReason,
      country: parsed.data.country,
      industry: parsed.data.industry,
      source: parsed.data.source,
      sort: parsed.data.sort,
      direction: parsed.data.direction,
      includeSnoozed: parsed.data.includeSnoozed === '1' || parsed.data.includeSnoozed === 'true',
    });

    return NextResponse.json({
      ...result,
      sellDate,
      harvestDate: cohort.harvestDate,
      status: cohort.status,
      dumpsterCount: cohort.dumpsterCount,
      keeperCount: cohort.keeperCount,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
