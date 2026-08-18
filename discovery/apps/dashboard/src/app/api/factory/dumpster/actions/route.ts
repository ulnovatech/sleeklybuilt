import { bulkOperationLogs, getDb } from '@agency/database';
import { factoryDumpsterActionSchema } from '@agency/validation';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireOperator } from '@/lib/api-auth';
import { FactoryDumpsterOps } from '@/lib/factory-dumpster';

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  const parsed = factoryDumpsterActionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

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

  const results = await new FactoryDumpsterOps().apply(data.action, data.memberIds, {
    snoozeDays: data.snoozeDays,
  });
  const succeeded = results.filter((row) => row.ok).length;
  const failed = results.length - succeeded;
  const logResults = results.map((row) => ({
    id: row.id,
    ok: row.ok,
    ...(row.error ? { error: row.error } : {}),
  }));
  const [operation] = await db
    .insert(bulkOperationLogs)
    .values({
      operatorId: operator,
      surface: 'factory_dumpster',
      action: data.action,
      idempotencyKey: data.idempotencyKey,
      selectionScope: 'explicit_ids',
      selectionQuery: null,
      requestedCount: data.memberIds.length,
      succeededCount: succeeded,
      failedCount: failed,
      results: logResults,
    })
    .returning();

  return NextResponse.json({
    operation,
    replayed: false,
    requested: data.memberIds.length,
    succeeded,
    failed,
    results,
  });
}
