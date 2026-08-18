import { bulkOperationLogs, getDb } from '@agency/database';
import { and, desc, eq, gt, type SQL } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/api-auth';

const querySchema = z.object({
  surface: z.enum(['leads', 'work_queue', 'demand_inbox', 'review_queue']).optional(),
  outcome: z.enum(['all', 'failed']).default('all'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/** Recent audited bulk operations for the signed-in operator (Automation Center observability). */
export async function GET(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    surface: searchParams.get('surface') ?? undefined,
    outcome: searchParams.get('outcome') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const conditions: SQL[] = [eq(bulkOperationLogs.operatorId, operator)];
  if (parsed.data.surface) conditions.push(eq(bulkOperationLogs.surface, parsed.data.surface));
  if (parsed.data.outcome === 'failed') conditions.push(gt(bulkOperationLogs.failedCount, 0));

  try {
    const rows = await getDb()
      .select({
        id: bulkOperationLogs.id,
        surface: bulkOperationLogs.surface,
        action: bulkOperationLogs.action,
        selectionScope: bulkOperationLogs.selectionScope,
        requestedCount: bulkOperationLogs.requestedCount,
        succeededCount: bulkOperationLogs.succeededCount,
        failedCount: bulkOperationLogs.failedCount,
        results: bulkOperationLogs.results,
        note: bulkOperationLogs.note,
        createdAt: bulkOperationLogs.createdAt,
      })
      .from(bulkOperationLogs)
      .where(and(...conditions))
      .orderBy(desc(bulkOperationLogs.createdAt))
      .limit(parsed.data.limit);

    const operations = rows.map((row) => ({
      ...row,
      failures: (row.results ?? [])
        .filter((result) => !result.ok)
        .slice(0, 10)
        .map((result) => ({ id: result.id, error: result.error ?? 'Unknown failure' })),
      results: undefined,
    }));

    return NextResponse.json({
      operations,
      failedTotal: operations.reduce((sum, op) => sum + op.failedCount, 0),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bulk operation history unavailable' },
      { status: 500 },
    );
  }
}
