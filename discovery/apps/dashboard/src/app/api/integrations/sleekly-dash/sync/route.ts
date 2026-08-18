import { isCronAuthorized } from '@/lib/cron-auth';
import { SleeklyDashBridgeService } from '@agency/integrations';
import { NextResponse } from 'next/server';
import { requireOperator } from '@/lib/api-auth';

const bridge = new SleeklyDashBridgeService();

/**
 * Pull outcomes + inbound from sleekly-dash.
 * Auth: operator session OR CRON_SECRET (Bearer / x-cron-secret).
 */
export async function POST(request: Request) {
  const cronOk = isCronAuthorized(request);
  if (!cronOk) {
    const operator = await requireOperator();
    if (operator instanceof NextResponse) return operator;
  }

  try {
    const result = await bridge.syncAll();
    if (!result.configured) {
      return NextResponse.json(result, { status: 503 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
