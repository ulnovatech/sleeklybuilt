import { requireOperator } from '@/lib/api-auth';
import { tryDemandJump } from '@/lib/factory-demand-jump';
import { IntentService } from '@agency/intent';
import { QualificationService } from '@agency/qualification';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const intent = new IntentService();
const qualification = new QualificationService();

const bodySchema = z.object({
  businessId: z.string().uuid(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await intent.matchDemandToBusiness(id, parsed.data.businessId);
    const score = await qualification.scoreBusiness(result.businessId);
    const factoryJump = await tryDemandJump(result.businessId, id);
    return NextResponse.json({ ...result, score, factoryJump });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
