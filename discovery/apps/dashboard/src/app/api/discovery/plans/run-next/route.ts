import { DiscoveryPlanService } from '@agency/discovery';
import { requireOperator } from '@/lib/api-auth';
import { enqueueRunPipeline, isInlinePipelineEnabled, resumeRunPipeline } from '@/lib/job-worker';
import { NextResponse } from 'next/server';

const plans = new DiscoveryPlanService();

/**
 * Run the next scheduled factory harvest cohort now (no country/city/industry form).
 * Auth: operator session (same as plan Run now).
 */
export async function POST() {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const result = await plans.runNextScheduledFactory();
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
      message: `Queued ${result.target.city}, ${result.target.country} · ${result.target.industry}`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
