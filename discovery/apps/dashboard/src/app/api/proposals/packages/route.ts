import { platformSettings } from '@agency/settings';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await platformSettings.ensureLoaded();
    const agency = platformSettings.getAgencySettings();
    return NextResponse.json({
      currency: agency.currency,
      brandName: agency.brandName,
      packages: agency.packages,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
