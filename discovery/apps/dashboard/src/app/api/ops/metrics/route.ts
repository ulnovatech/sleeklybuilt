import { requireOperator } from '@/lib/api-auth';
import { OpsMetricsService } from '@agency/ops';
import { NextResponse } from 'next/server';

const ops = new OpsMetricsService();

export async function GET(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const since = new URL(request.url).searchParams.get('since');
    const metrics = await ops.getMetrics({ since });
    return NextResponse.json(metrics);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
