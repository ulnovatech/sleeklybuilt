import { DiscoveryService, getRunWithEnrichedBusinesses } from '@agency/discovery';
import { IntentService } from '@agency/intent';
import { listQuerySchema, parseListSearchParams } from '@agency/validation';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const discovery = new DiscoveryService();
const intent = new IntentService();

const runBusinessesSchema = listQuerySchema.extend({
  sort: z.enum(['name', 'city', 'source']).default('name'),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const parsed = parseListSearchParams(runBusinessesSchema, searchParams);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = await getRunWithEnrichedBusinesses(id, parsed.data);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const signalsByBusiness = await intent.listByBusinessIds(data.businesses.map((b) => b.id));
    const businesses = data.businesses.map((b) => ({
      ...b,
      signals: signalsByBusiness.get(b.id) ?? [],
    }));

    return NextResponse.json({
      run: data.run,
      businesses,
      items: businesses,
      total: data.total,
      page: data.page,
      limit: data.limit,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
