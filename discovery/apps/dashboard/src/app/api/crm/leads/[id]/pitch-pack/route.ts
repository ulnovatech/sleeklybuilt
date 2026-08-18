import { AccountService } from '@agency/accounts';
import { CrmService } from '@agency/crm';
import { DiscoveryService } from '@agency/discovery';
import {
  buildCaseFile,
  buildOutreachOpener,
  buildPitchPack,
  IntelligenceService,
  normalizeBusinessIntelligenceProfile,
} from '@agency/intelligence';
import { OutreachService } from '@agency/outreach';
import { QualificationService } from '@agency/qualification';
import { NextResponse } from 'next/server';

const crm = new CrmService();
const discovery = new DiscoveryService();
const intelligence = new IntelligenceService();
const qualification = new QualificationService();
const outreach = new OutreachService();
const accounts = new AccountService();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { lead } = await crm.getLeadWithDetails(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const account = await accounts.getById(lead.accountId);
    const suppressed = account ? await accounts.isSuppressed(account) : false;

    const [profile, websiteBrief, messages] = await Promise.all([
      intelligence.getBiProfileByBusinessId(lead.businessId),
      qualification.getOpportunityBrief(lead.businessId),
      outreach.listMessages(id),
    ]);

    const normalizedProfile = profile
      ? normalizeBusinessIntelligenceProfile(profile.profile)
      : null;

    const lastMessage = messages[0] ?? null;
    const pursuitContext = {
      leadId: lead.id,
      status: lead.status,
      lastOutreach: lastMessage
        ? {
            channel: lastMessage.channel,
            subject: lastMessage.subject ?? null,
            body: lastMessage.body ?? null,
            sentAt: (lastMessage.sentAt ?? lastMessage.createdAt).toISOString(),
          }
        : null,
      nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
    };

    const caseFile = buildCaseFile({
      profile: normalizedProfile,
      websiteBrief,
      pursuitContext,
      suppressed,
    });
    const pitchPack = caseFile
      ? buildPitchPack({ profile: normalizedProfile, websiteBrief, pursuitContext, suppressed })
      : null;

    if (!caseFile || !pitchPack) {
      const business = await discovery.getBusiness(lead.businessId);
      return NextResponse.json({
        pitchPack: null,
        caseFile: null,
        state: suppressed ? 'blocked' : 'processing',
        message: suppressed
          ? 'This account is suppressed — outreach is blocked.'
          : business
            ? 'Business intelligence is still being enriched. Refresh when the pipeline completes.'
            : 'The linked business could not be found.',
        suppressed,
      });
    }

    const rulesOpener = buildOutreachOpener({
      businessName: caseFile.identity.name,
      city: caseFile.identity.city,
      industry: caseFile.identity.industry,
      pains: caseFile.pains.map((pain) => ({
        id: pain.id,
        label: pain.label,
        confidence: pain.confidence,
        evidenceIds: pain.evidenceIds,
        sources: ['bi_profile' as const],
      })),
      evidence: caseFile.evidence.map((item) => ({
        id: item.id,
        label: item.label,
        excerpt: item.excerpt,
        url: item.url,
        source: 'bi_profile' as const,
      })),
      pitchAngle: caseFile.pitchAngle,
      topService: caseFile.recommendedServices[0] ?? null,
    });

    return NextResponse.json({
      pitchPack,
      caseFile,
      state: caseFile.status,
      suppressed,
      rulesOpener: rulesOpener.opener,
      message: suppressed
        ? 'This account is suppressed — pitch generation is blocked.'
        : caseFile.status === 'partial'
          ? 'Limited evidence — pitches will stay conservative.'
          : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
