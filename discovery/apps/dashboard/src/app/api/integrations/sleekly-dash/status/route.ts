import { SleeklyDashBridgeService } from '@agency/integrations';
import { NextResponse } from 'next/server';
import { requireOperator } from '@/lib/api-auth';

const bridge = new SleeklyDashBridgeService();

export async function GET() {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const status = await bridge.getStatus();
    return NextResponse.json(status);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
