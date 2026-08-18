import { getDb, operatorSavedViews } from '@agency/database';
import { and, asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/api-auth';

const surfaceSchema = z.enum([
  'work_queue',
  'review_queue',
  'leads',
  'discovery_runs',
  'discovery_plans',
  'follow_ups',
]);
const definitionSchema = z.object({
  filters: z.record(z.string()).default({}),
  sort: z.string().max(50).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
  columns: z.array(z.string().max(100)).max(50).optional(),
  density: z.enum(['compact', 'comfortable']).optional(),
});
const createSchema = z.object({
  surface: surfaceSchema,
  name: z.string().trim().min(1).max(200),
  definition: definitionSchema,
  isDefault: z.boolean().optional().default(false),
});

export async function GET(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;
  const surface = new URL(request.url).searchParams.get('surface');
  const parsedSurface = surfaceSchema.safeParse(surface);
  if (!parsedSurface.success) {
    return NextResponse.json({ error: 'A valid surface is required.' }, { status: 400 });
  }

  const views = await getDb()
    .select()
    .from(operatorSavedViews)
    .where(and(eq(operatorSavedViews.operatorId, operator), eq(operatorSavedViews.surface, parsedSurface.data)))
    .orderBy(asc(operatorSavedViews.name));
  return NextResponse.json({ views });
}

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = getDb();
  if (parsed.data.isDefault) {
    await db
      .update(operatorSavedViews)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(operatorSavedViews.operatorId, operator), eq(operatorSavedViews.surface, parsed.data.surface)));
  }
  const [view] = await db
    .insert(operatorSavedViews)
    .values({ ...parsed.data, operatorId: operator })
    .returning();
  return NextResponse.json({ view }, { status: 201 });
}
