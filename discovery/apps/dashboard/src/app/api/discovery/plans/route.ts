import { DiscoveryPlanService } from '@agency/discovery';
import {
  createDiscoveryPlanSchema,
  discoveryPlansListQuerySchema,
  parseListSearchParams,
} from '@agency/validation';
import { requireOperator } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

const plans = new DiscoveryPlanService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = parseListSearchParams(discoveryPlansListQuerySchema, searchParams);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const result = await plans.listPlans(parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const body = await request.json();
    const parsed = createDiscoveryPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const result = await plans.createPlan(parsed.data, operator);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
