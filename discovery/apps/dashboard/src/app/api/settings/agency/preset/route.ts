import {
  listAgencyPresets,
  platformSettings,
  type AgencyPresetId,
} from '@agency/settings';
import { requireOperator } from '@/lib/api-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  presetId: z.enum(['generic', 'sleeklybuilt']),
});

export async function GET() {
  try {
    return NextResponse.json({ presets: listAgencyPresets() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const agency = await platformSettings.applyAgencyPreset(
      parsed.data.presetId as Exclude<AgencyPresetId, 'custom'>,
    );
    return NextResponse.json({ agency });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
