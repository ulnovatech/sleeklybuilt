import {
  buildCaseFile,
  IntelligenceService,
  normalizeBusinessIntelligenceProfile,
} from '@agency/intelligence';
import { QualificationService } from '@agency/qualification';
import { NextResponse } from 'next/server';

const intelligence = new IntelligenceService();
const qualification = new QualificationService();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId } = await params;
    const [profile, websiteBrief] = await Promise.all([
      intelligence.getBiProfileByBusinessId(businessId),
      qualification.getOpportunityBrief(businessId).catch(() => null),
    ]);

    const caseFile = buildCaseFile({
      profile: profile ? normalizeBusinessIntelligenceProfile(profile.profile) : null,
      websiteBrief,
      pursuitContext: null,
    });

    if (!caseFile) {
      return NextResponse.json({
        caseFile: null,
        state: 'processing',
        message: 'Business intelligence is still being enriched. Refresh when the pipeline completes.',
      });
    }

    return NextResponse.json({
      caseFile,
      state: caseFile.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.toLowerCase().includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
