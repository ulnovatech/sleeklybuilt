import { getDb, leadScores, websiteAnalyses } from '@agency/database';
import { inArray } from 'drizzle-orm';
import { DiscoveryRepository, type DiscoveryBusinessesListInput } from './repository';

export async function getRunWithEnrichedBusinesses(
  runId: string,
  paging?: Omit<DiscoveryBusinessesListInput, 'runId'>,
) {
  const repo = new DiscoveryRepository();
  const run = await repo.getRun(runId);
  if (!run) return null;

  const paged = await repo.listBusinessesByRunPaged({
    runId,
    page: paging?.page ?? 1,
    limit: paging?.limit ?? 20,
    q: paging?.q,
    sort: paging?.sort ?? 'name',
    direction: paging?.direction ?? 'asc',
  });

  const ids = paged.items.map((b) => b.id);
  const db = getDb();
  const analyses =
    ids.length === 0
      ? []
      : await db.select().from(websiteAnalyses).where(inArray(websiteAnalyses.businessId, ids));
  const scores =
    ids.length === 0 ? [] : await db.select().from(leadScores).where(inArray(leadScores.businessId, ids));

  const analysisByBusiness = new Map(analyses.map((row) => [row.businessId, row]));
  const scoreByBusiness = new Map(scores.map((row) => [row.businessId, row]));

  const businesses = paged.items.map((b) => {
    const analysis = analysisByBusiness.get(b.id) ?? null;
    const score = scoreByBusiness.get(b.id) ?? null;
    return {
      ...b,
      analysis,
      score: score?.score ?? null,
      scoreFactors: score?.factors ?? null,
    };
  });

  return {
    run,
    businesses,
    total: paged.total,
    page: paged.page,
    limit: paged.limit,
  };
}
