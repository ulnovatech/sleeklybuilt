import { requireOperator } from '@/lib/api-auth';
import { listOutreachQueue } from '@/lib/outreach-queue';
import { resolveOwnerScope } from '@/lib/owner-scope';
import { outreachQueueListQuerySchema, parseListSearchParams } from '@agency/validation';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = parseListSearchParams(outreachQueueListQuerySchema, searchParams);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const owner = await resolveOwnerScope(searchParams.get('owner'));
    const result = await listOutreachQueue({ ...parsed.data, owner });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
