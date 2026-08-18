import { resolveOwnerScope } from '@/lib/owner-scope';
import { CrmService } from '@agency/crm';
import { crmFollowUpsListQuerySchema, parseListSearchParams } from '@agency/validation';
import { NextResponse } from 'next/server';

const crm = new CrmService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = parseListSearchParams(crmFollowUpsListQuerySchema, searchParams);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const owner = await resolveOwnerScope(searchParams.get('owner'));
    const result = await crm.listFollowUpsPaged({ ...parsed.data, owner });

    return NextResponse.json({
      items: result.items,
      /** @deprecated Prefer `items`; kept during client migration. */
      leads: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      ownerScope: owner ?? 'all',
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
