import { DiscoveryPlanService } from '@agency/discovery';
import { requireOperator } from '@/lib/api-auth';
import { enqueueRunPipeline, isInlinePipelineEnabled, resumeRunPipeline } from '@/lib/job-worker';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const plans = new DiscoveryPlanService();

const bodySchema = z.object({
  targetId: z.string().uuid().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const { id } = await ctx.params;
    let targetId: string | undefined;
    try {
      const body = await request.json();
      const parsed = bodySchema.safeParse(body);
      if (parsed.success) targetId = parsed.data.targetId;
    } catch {
      // empty body ok
    }

    const result = await plans.runNow(id, targetId);
    await enqueueRunPipeline(result.run.id);
    const inline = isInlinePipelineEnabled();
    if (inline) {
      await resumeRunPipeline(result.run.id);
    }

    return NextResponse.json({
      plan: result.plan,
      target: result.target,
      run: result.run,
      queued: true,
      inlinePipeline: inline,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
