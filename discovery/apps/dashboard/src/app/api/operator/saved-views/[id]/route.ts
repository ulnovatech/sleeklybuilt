import { getDb, operatorSavedViews } from '@agency/database';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/api-auth';

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  definition: z.object({
    filters: z.record(z.string()).default({}),
    sort: z.string().max(50).optional(),
    direction: z.enum(['asc', 'desc']).optional(),
    columns: z.array(z.string().max(100)).max(50).optional(),
    density: z.enum(['compact', 'comfortable']).optional(),
  }).optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;
  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = getDb();
  const [existing] = await db
    .select()
    .from(operatorSavedViews)
    .where(and(eq(operatorSavedViews.id, id), eq(operatorSavedViews.operatorId, operator)));
  if (!existing) return NextResponse.json({ error: 'Saved view not found.' }, { status: 404 });

  if (parsed.data.isDefault) {
    await db
      .update(operatorSavedViews)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(operatorSavedViews.operatorId, operator), eq(operatorSavedViews.surface, existing.surface)));
  }
  const [view] = await db
    .update(operatorSavedViews)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(operatorSavedViews.id, id), eq(operatorSavedViews.operatorId, operator)))
    .returning();
  return NextResponse.json({ view });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;
  const { id } = await params;
  const [deleted] = await getDb()
    .delete(operatorSavedViews)
    .where(and(eq(operatorSavedViews.id, id), eq(operatorSavedViews.operatorId, operator)))
    .returning({ id: operatorSavedViews.id });
  if (!deleted) return NextResponse.json({ error: 'Saved view not found.' }, { status: 404 });
  return NextResponse.json({ deleted: true, id: deleted.id });
}
