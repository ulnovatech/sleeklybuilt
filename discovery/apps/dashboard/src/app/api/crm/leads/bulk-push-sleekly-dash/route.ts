import { SleeklyDashBridgeService } from '@agency/integrations';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/api-auth';
import { bulkOperationLogs, getDb } from '@agency/database';
import { and, eq } from 'drizzle-orm';

const requestSchema = z.object({
  leadIds: z.array(z.string().uuid()).min(1).max(100),
  idempotencyKey: z.string().trim().min(8).max(100),
});

const bridge = new SleeklyDashBridgeService();

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
    .where(
      and(eq(bulkOperationLogs.operatorId, operator), eq(bulkOperationLogs.idempotencyKey, data.idempotencyKey)),
    );

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

  const leadIds = [...new Set(data.leadIds)];
  const results: Array<{ id: string; ok: boolean; error?: string; prospectId?: number | null }> = [];
  for (const leadId of leadIds) {
    try {
      const pushed = await bridge.pushLead(leadId);
      results.push({
        id: leadId,
        ok: true,
        prospectId: pushed.prospectId,
      });
    } catch (error) {
      results.push({
        id: leadId,
        ok: false,
        error: error instanceof Error ? error.message : 'Push failed',
      });
    }
  }

  const succeeded = results.filter((result) => result.ok).length;
  const failed = results.length - succeeded;
  const [operation] = await db
    .insert(bulkOperationLogs)
    .values({
      operatorId: operator,
      surface: 'leads',
      action: 'push_sleekly-dash',
      idempotencyKey: data.idempotencyKey,
      selectionScope: 'explicit_ids',
      selectionQuery: { action: 'push_sleekly-dash' },
      requestedCount: leadIds.length,
      succeededCount: succeeded,
      failedCount: failed,
      results,
    })
    .returning();

  return NextResponse.json(
    {
      operation,
      replayed: false,
      requested: leadIds.length,
      succeeded,
      failed,
      results,
    },
    { status: failed > 0 ? 207 : 200 },
  );
}
