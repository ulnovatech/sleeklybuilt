import { SleeklyDashBridgeService } from '@agency/integrations';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/api-auth';

const bodySchema = z.object({
  leadId: z.string().uuid(),
});

const bridge = new SleeklyDashBridgeService();

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await bridge.pushLead(parsed.data.leadId);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const status = /not configured/i.test(message) ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
