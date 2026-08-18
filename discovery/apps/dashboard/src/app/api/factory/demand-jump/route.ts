import { FactoryDemandJump } from '@/lib/factory-demand-jump';
import { requireOperator } from '@/lib/api-auth';
import { factoryDemandJumpSchema } from '@agency/validation';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const parsed = factoryDemandJumpSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const result = await new FactoryDemandJump().jumpBusiness(
      parsed.data.businessId,
      parsed.data.signalId,
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
