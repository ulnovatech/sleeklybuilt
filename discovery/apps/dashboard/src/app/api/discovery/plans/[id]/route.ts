import { DiscoveryPlanService } from '@agency/discovery';
import { updateDiscoveryPlanSchema } from '@agency/validation';
import { requireOperator } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

const plans = new DiscoveryPlanService();

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const result = await plans.getPlan(id);
    if (!result) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = updateDiscoveryPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const plan = await plans.updatePlan(id, parsed.data);
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    return NextResponse.json({ plan });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
