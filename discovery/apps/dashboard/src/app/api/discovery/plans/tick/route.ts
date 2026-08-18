import { isCronAuthorized } from '@/lib/cron-auth';
import { enqueueRunPipeline } from '@/lib/job-worker';
import { tickDiscoveryPlans } from '@agency/discovery';
import { NextResponse } from 'next/server';

/**
 * Cron / ops trigger for Discovery Plan scheduling.
 * Auth: CRON_SECRET via Bearer or x-cron-secret (middleware bypass when valid).
 */
export async function POST(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await tickDiscoveryPlans({
      enqueueRun: enqueueRunPipeline,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
