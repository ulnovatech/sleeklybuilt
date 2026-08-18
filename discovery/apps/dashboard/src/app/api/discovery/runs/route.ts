import { DiscoveryService } from '@agency/discovery';
import { createDiscoveryRunSchema, listQuerySchema, parseListSearchParams } from '@agency/validation';
import { requireOperator } from '@/lib/api-auth';
import { enqueueRunPipeline, isInlinePipelineEnabled, resumeRunPipeline } from '@/lib/job-worker';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const discovery = new DiscoveryService();

const discoveryRunsListSchema = listQuerySchema.extend({
  status: z.string().max(30).optional(),
  planId: z.string().uuid().optional(),
  hasPlan: z
    .enum(['1', '0', 'true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === '1' || v === 'true')),
  sort: z.enum(['createdAt', 'status', 'country', 'industry']).default('createdAt'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = parseListSearchParams(discoveryRunsListSchema, searchParams);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const result = await discovery.listRunsPaged(parsed.data);
    return NextResponse.json({
      items: result.items,
      runs: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const body = await request.json();
    const parsed = createDiscoveryRunSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const run = await discovery.prepareRun(parsed.data);
    await enqueueRunPipeline(run.id);

    const inline = isInlinePipelineEnabled();
    if (inline) {
      await resumeRunPipeline(run.id);
    }

    return NextResponse.json(
      {
        run: await discovery.getRun(run.id),
        queued: true,
        inlinePipeline: inline,
        message: inline
          ? 'Run started — pipeline advances on each progress poll (INLINE_PIPELINE dev mode)'
          : 'Run queued — start job worker: pnpm jobs:worker',
      },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
