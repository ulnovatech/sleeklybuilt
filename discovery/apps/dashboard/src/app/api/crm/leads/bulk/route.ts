import { bulkOperationLogs, getDb } from '@agency/database';
import { CrmService } from '@agency/crm';
import type { LeadStatus } from '@agency/types';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/api-auth';

const requestSchema = z.object({
  action: z.enum(['transition']),
  leadIds: z.array(z.string().uuid()).min(1).max(100),
  toStatus: z.enum([
    'NEW',
    'REVIEWED',
    'CONTACTED',
    'REPLIED',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'CLOSED_WON',
    'CLOSED_LOST',
    'NO_RESPONSE',
    'NOT_INTERESTED',
    'ARCHIVED',
  ]),
  note: z.string().trim().max(500).optional(),
  idempotencyKey: z.string().trim().min(8).max(100),
});

const crm = new CrmService();

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

  const leadIds = [...new Set(data.leadIds)];
  const results: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const leadId of leadIds) {
    try {
      await crm.transition(leadId, data.toStatus as LeadStatus, data.note);
      results.push({ id: leadId, ok: true });
    } catch (error) {
      results.push({
        id: leadId,
        ok: false,
        error: error instanceof Error ? error.message : 'Transition failed',
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
      action: `transition:${data.toStatus}`,
      idempotencyKey: data.idempotencyKey,
      selectionScope: 'explicit_ids',
      selectionQuery: { toStatus: data.toStatus },
      requestedCount: leadIds.length,
      succeededCount: succeeded,
      failedCount: failed,
      results,
      note: data.note ?? null,
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
