import { bulkOperationLogs, getDb } from '@agency/database';
import { IntentService } from '@agency/intent';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/api-auth';

const requestSchema = z.object({
  action: z.enum(['dismiss']),
  signalIds: z.array(z.string().uuid()).min(1).max(100),
  idempotencyKey: z.string().trim().min(8).max(100),
});

const intent = new IntentService();

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const db = getDb();
  const [prior] = await db
    .select()
    .from(bulkOperationLogs)
    .where(and(eq(bulkOperationLogs.operatorId, operator), eq(bulkOperationLogs.idempotencyKey, data.idempotencyKey)));

  if (prior) {
    return NextResponse.json({
      operation: prior,
      replayed: true,
      requested: prior.requestedCount,
      succeeded: prior.succeededCount,
      failed: prior.failedCount,
      results: prior.results,
    });
  }

  const signalIds = [...new Set(data.signalIds)];
  const results: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const signalId of signalIds) {
    try {
      await intent.dismissOrphanDemand(signalId);
      results.push({ id: signalId, ok: true });
    } catch (error) {
      results.push({
        id: signalId,
        ok: false,
        error: error instanceof Error ? error.message : 'Dismiss failed',
      });
    }
  }

  const succeeded = results.filter((result) => result.ok).length;
  const failed = results.length - succeeded;
  const [operation] = await db
    .insert(bulkOperationLogs)
    .values({
      operatorId: operator,
      surface: 'demand_inbox',
      action: data.action,
      idempotencyKey: data.idempotencyKey,
      selectionScope: 'explicit_ids',
      selectionQuery: null,
      requestedCount: signalIds.length,
      succeededCount: succeeded,
      failedCount: failed,
      results,
      note: null,
    })
    .returning();

  return NextResponse.json(
    {
      operation,
      replayed: false,
      requested: signalIds.length,
      succeeded,
      failed,
      results,
    },
    { status: failed > 0 ? 207 : 200 },
  );
}
