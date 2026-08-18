import { bulkOperationLogs, getDb } from '@agency/database';
import { QualificationService } from '@agency/qualification';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/api-auth';

const requestSchema = z.object({
  action: z.enum(['dismiss', 'reject']),
  accountIds: z.array(z.string().uuid()).min(1).max(100),
  idempotencyKey: z.string().trim().min(8).max(100),
  reason: z.string().trim().max(500).optional(),
});

const qualification = new QualificationService();

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

  const accountIds = [...new Set(data.accountIds)];
  const results: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const accountId of accountIds) {
    try {
      if (data.action === 'dismiss') await qualification.dismissFromReview(accountId);
      else await qualification.rejectFromReview(accountId, data.reason);
      results.push({ id: accountId, ok: true });
    } catch (error) {
      results.push({ id: accountId, ok: false, error: error instanceof Error ? error.message : 'Operation failed' });
    }
  }

  const succeeded = results.filter((result) => result.ok).length;
  const failed = results.length - succeeded;
  const [operation] = await db
    .insert(bulkOperationLogs)
    .values({
      operatorId: operator,
      surface: 'review_queue',
      action: data.action,
      idempotencyKey: data.idempotencyKey,
      selectionScope: 'explicit_ids',
      selectionQuery: null,
      requestedCount: accountIds.length,
      succeededCount: succeeded,
      failedCount: failed,
      results,
      note: data.reason ?? null,
    })
    .returning();

  return NextResponse.json(
    {
      operation,
      replayed: false,
      requested: accountIds.length,
      succeeded,
      failed,
      results,
    },
    { status: failed > 0 ? 207 : 200 },
  );
}
