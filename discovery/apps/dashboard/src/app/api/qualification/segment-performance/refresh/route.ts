import { isCronAuthorized } from '@/lib/cron-auth';
import { refreshSegmentPerformance } from '@agency/qualification';
import { NextResponse } from 'next/server';
import { requireOperator } from '@/lib/api-auth';

/**
 * Rebuild segment_performance from lead_outcomes (C8).
 * Auth: operator session OR CRON_SECRET.
 */
export async function POST(request: Request) {
  const cronOk = isCronAuthorized(request);
  if (!cronOk) {
    const operator = await requireOperator();
    if (operator instanceof NextResponse) return operator;
  }

  try {
    const result = await refreshSegmentPerformance();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
