import { requireOperator } from '@/lib/api-auth';
import { AccountService } from '@agency/accounts';
import { CrmService } from '@agency/crm';
import {
  buildCaseFile,
  DraftGenerationError,
  generateOutreachDraft,
  getCachedDraft,
  getDraftBudgetStatus,
  IntelligenceService,
  normalizeBusinessIntelligenceProfile,
  type DraftChannel,
} from '@agency/intelligence';
import { OutreachService } from '@agency/outreach';
import { QualificationService } from '@agency/qualification';
import { platformSettings } from '@agency/settings';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const crm = new CrmService();
const intelligence = new IntelligenceService();
const qualification = new QualificationService();
const outreach = new OutreachService();
const accounts = new AccountService();

const channelSchema = z.enum(['email', 'whatsapp', 'phone', 'follow_up']);
const postSchema = z.object({
  channel: channelSchema,
  regenerate: z.boolean().optional().default(false),
});

async function loadCaseFileForLead(leadId: string) {
  const { lead } = await crm.getLeadWithDetails(leadId);
  if (!lead) {
    return {
      lead: null,
      caseFile: null as ReturnType<typeof buildCaseFile>,
      suppressed: false,
    };
  }

  const account = await accounts.getById(lead.accountId);
  const suppressed = account ? await accounts.isSuppressed(account) : false;

  const [profile, websiteBrief, messages] = await Promise.all([
    intelligence.getBiProfileByBusinessId(lead.businessId),
    qualification.getOpportunityBrief(lead.businessId),
    outreach.listMessages(leadId),
  ]);

  const lastMessage = messages[0] ?? null;
  const caseFile = buildCaseFile({
    profile: profile ? normalizeBusinessIntelligenceProfile(profile.profile) : null,
    websiteBrief,
    pursuitContext: {
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
    },
    suppressed,
  });

  return { lead, caseFile, suppressed };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const { id } = await params;
    const channelParam = new URL(request.url).searchParams.get('channel');
    const channelParsed = channelSchema.safeParse(channelParam);
    if (!channelParsed.success) {
      return NextResponse.json(
        { error: 'channel must be email, whatsapp, phone, or follow_up' },
        { status: 400 },
      );
    }
    const channel = channelParsed.data as DraftChannel;
    const { lead } = await crm.getLeadWithDetails(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    await platformSettings.ensureLoaded();
    const [draft, budget, settings] = await Promise.all([
      getCachedDraft(id, channel),
      getDraftBudgetStatus(),
      Promise.resolve(platformSettings.getSync()),
    ]);

    const credentialKey =
      settings.drafts.provider === 'openai'
        ? 'openai_api_key'
        : settings.drafts.provider === 'anthropic'
          ? 'anthropic_api_key'
          : 'openrouter_api_key';
    const credential = platformSettings.getCredentialStatuses().find((item) => item.key === credentialKey);

    const storedFactPack = draft?.factPack as { phoneSections?: unknown } | undefined;

    return NextResponse.json({
      draft: draft
        ? {
            id: draft.id,
            leadId: draft.leadId,
            channel: draft.channel,
            subject: draft.subject,
            body: draft.body,
            provider: draft.provider,
            model: draft.model,
            regenerated: draft.regenerated,
            updatedAt: draft.updatedAt,
            cached: true,
            phoneSections: storedFactPack?.phoneSections ?? null,
          }
        : null,
      budget,
      drafts: settings.drafts,
      credentialConfigured: Boolean(credential?.configured),
      credentialSource: credential?.source ?? 'none',
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const { id } = await params;
    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { lead, caseFile, suppressed } = await loadCaseFileForLead(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    if (suppressed || caseFile?.status === 'blocked') {
      return NextResponse.json(
        {
          error: 'This account is suppressed — outreach drafts are blocked.',
          code: 'account_suppressed',
        },
        { status: 403 },
      );
    }
    if (!caseFile) {
      return NextResponse.json(
        { error: 'Case File is not ready yet. Wait for enrichment to finish.' },
        { status: 409 },
      );
    }

    const draft = await generateOutreachDraft({
      leadId: id,
      accountId: lead.accountId,
      channel: parsed.data.channel,
      caseFile,
      regenerate: parsed.data.regenerate,
      operatorId: operator,
    });
    const budget = await getDraftBudgetStatus();

    return NextResponse.json({
      draft,
      budget,
      cached: draft.cached,
      warning:
        caseFile.status === 'partial'
          ? 'Case File intelligence is partial — pitch stayed conservative to evidence on file.'
          : undefined,
      caseFileStatus: caseFile.status,
    });
  } catch (error) {
    if (error instanceof DraftGenerationError) {
      const status =
        error.code === 'budget_exhausted'
          ? 402
          : error.code === 'account_suppressed'
            ? 403
            : error.code === 'missing_credentials' || error.code === 'disabled'
              ? 503
              : error.code === 'whatsapp_ineligible' ||
                  error.code === 'phone_ineligible' ||
                  error.code === 'invalid_fact_pack'
                ? 422
                : 502;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
