import { createHash } from 'crypto';
import { AccountService } from '@agency/accounts';
import { BudgetGovernor, BudgetExhaustedError } from '@agency/acquisition';
import { logger } from '@agency/config';
import { getDb, outreachDrafts } from '@agency/database';
import { platformSettings, type CredentialKey, type DraftProvider } from '@agency/settings';
import { and, desc, eq } from 'drizzle-orm';
import type { CaseFile } from './case-file';
import type { PitchPack } from './pitch-pack';

export type DraftChannel = 'email' | 'whatsapp' | 'phone' | 'follow_up';

export type PhoneDraftSections = {
  opening15s: string;
  valueHook: string;
  evidenceMention: string;
  ask: string;
  objectionHandlers: string[];
  close: string;
};

export type DraftFactPack = {
  identity: CaseFile['identity'];
  presence: CaseFile['presence'];
  score: number | null;
  reachability: string | null;
  weaknesses: CaseFile['weaknesses'];
  pains: CaseFile['pains'];
  pitchAngle: string | null;
  executiveSummary: string | null;
  recommendedServices: string[];
  purchaseReadiness: CaseFile['purchaseReadiness'];
  solutions: CaseFile['solutions'];
  sentiment: CaseFile['sentiment'];
  websiteGaps: CaseFile['websiteGaps'];
  techStack: CaseFile['techStack'];
  projectValue: CaseFile['projectValue'];
  pursuitContext: CaseFile['pursuitContext'];
  evidence: CaseFile['evidence'];
  contact: {
    email: string | null;
    phone: string | null;
    whatsappStatus: string;
  };
  channel: DraftChannel;
  agency: {
    brandName: string;
    senderName: string;
    currency: string;
    packages: Array<{ id: string; title: string; priceUgx: number }>;
    services: string[];
  };
  /** Populated after phone draft generation for UI expand */
  phoneSections?: PhoneDraftSections | null;
};

export type ParsedDraft = {
  subject: string | null;
  body: string;
  phoneSections?: PhoneDraftSections | null;
};

export type OutreachDraftRecord = {
  id: string;
  leadId: string;
  channel: DraftChannel;
  subject: string | null;
  body: string;
  factPackHash: string;
  provider: string;
  model: string;
  regenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  cached: boolean;
  phoneSections?: PhoneDraftSections | null;
};

export class DraftGenerationError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'disabled'
      | 'missing_credentials'
      | 'budget_exhausted'
      | 'whatsapp_ineligible'
      | 'phone_ineligible'
      | 'provider_failed'
      | 'invalid_fact_pack'
      | 'account_suppressed',
  ) {
    super(message);
    this.name = 'DraftGenerationError';
  }
}

const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_CHAT_URL = 'https://api.anthropic.com/v1/messages';
const DRAFT_TIMEOUT_MS = 120_000;

const CREDENTIAL_BY_PROVIDER: Record<DraftProvider, CredentialKey> = {
  openrouter: 'openrouter_api_key',
  openai: 'openai_api_key',
  anthropic: 'anthropic_api_key',
};

export type DraftSource = CaseFile | PitchPack;

function isCaseFile(source: DraftSource): source is CaseFile {
  return 'version' in source && source.version === 2;
}

function toCaseFile(source: DraftSource): CaseFile {
  if (isCaseFile(source)) return source;
  return {
    version: 2,
    status: source.status === 'blocked' ? 'blocked' : source.status,
    identity: source.identity,
    presence: source.presence,
    score: source.score,
    reachability: source.reachability,
    weaknesses: source.weaknesses,
    pains: [],
    pitchAngle: source.pitchAngle,
    executiveSummary: null,
    recommendedServices: source.recommendedServices,
    purchaseReadiness: null,
    solutions: [],
    sentiment: null,
    websiteGaps: [],
    techStack: null,
    projectValue: null,
    evidence: source.evidence,
    pursuitContext: null,
    contact: source.contact,
  };
}

export function buildDraftFactPack(caseFile: DraftSource, channel: DraftChannel): DraftFactPack {
  const file = toCaseFile(caseFile);
  const agency = platformSettings.getAgencySettings();
  return {
    identity: file.identity,
    presence: file.presence,
    score: file.score,
    reachability: file.reachability,
    weaknesses: file.weaknesses,
    pains: file.pains,
    pitchAngle: file.pitchAngle,
    executiveSummary: file.executiveSummary,
    recommendedServices: file.recommendedServices,
    purchaseReadiness: file.purchaseReadiness,
    solutions: file.solutions,
    sentiment: file.sentiment,
    websiteGaps: file.websiteGaps,
    techStack: file.techStack,
    projectValue: file.projectValue,
    pursuitContext: file.pursuitContext,
    evidence: file.evidence,
    contact: {
      email: file.contact.email,
      phone: file.contact.phone,
      whatsappStatus: file.contact.whatsapp.status,
    },
    channel,
    agency: {
      brandName: agency.brandName || 'web agency',
      senderName: agency.senderName || agency.brandName || '',
      currency: agency.currency,
      packages: agency.packages.map((p) => ({
        id: p.id,
        title: p.title,
        priceUgx: p.priceUgx,
      })),
      services: agency.services.map((s) => s.name),
    },
  };
}

export function hashFactPack(factPack: DraftFactPack): string {
  return createHash('sha256').update(JSON.stringify(factPack)).digest('hex');
}

function channelInstructions(channel: DraftChannel, brandName: string): string[] {
  const agency = brandName.trim() || 'a web agency';
  if (channel === 'email') {
    return [
      `Write a concise cold outreach email for ${agency}.`,
      'Platform: email — use a clear subject line, short paragraphs, professional tone, one specific ask.',
      'Return JSON with subject (string, max 90 chars) and body (string, max 900 chars).',
      'Tone: professional, specific, non-hype. No fabricated metrics or reviews.',
    ];
  }
  if (channel === 'whatsapp') {
    return [
      `Write a short WhatsApp outreach message for ${agency}.`,
      'Platform: WhatsApp — mobile-first, brevity, direct greeting, one clear ask, no formal letter structure.',
      'Return JSON with subject null and body (string, max 420 chars).',
      'Tone: direct and polite; one clear ask; no links unless from evidence URLs in factPack.',
    ];
  }
  if (channel === 'phone') {
    return [
      `Write a cold-call talk track for ${agency} to speak to the business owner.`,
      'Platform: phone — spoken cadence, 60–90 seconds total, name the business and city naturally.',
      'Ground the hook in factPack.weaknesses or factPack.pains only.',
      'Return JSON with subject null, body (string, full formatted script the operator reads), and sections object:',
      'sections.opening15s, sections.valueHook, sections.evidenceMention, sections.ask, sections.objectionHandlers (array of 2 strings max), sections.close.',
      'Tone: conversational, confident, not scripted-sounding; no fabricated reviews or metrics.',
    ];
  }
  return [
    `Write a brief follow-up message after prior outreach for ${agency}.`,
    'Platform: follow-up — reference factPack.pursuitContext only; do not invent prior conversation details.',
    'Return JSON with subject (string, optional, max 90 chars) and body (string, max 700 chars).',
    'Tone: respectful reminder grounded only in provided facts.',
  ];
}

export function buildDraftPrompt(factPack: DraftFactPack): string {
  return JSON.stringify(
    {
      factPack,
      instructions: [
        ...channelInstructions(factPack.channel, factPack.agency.brandName),
        'Use only facts in factPack. Never invent pains, reviews, or contact details.',
        'Ground claims in weaknesses, pains, and evidence labels only.',
        'When factPack.agency.packages is non-empty, prefer those package titles for offers.',
        'When factPack.sentiment.complaintThemes is non-empty, you may reference one complaint theme if evidence-backed.',
      ],
    },
    null,
    0,
  );
}

type ProviderDraftJson = {
  subject?: unknown;
  body?: unknown;
  sections?: {
    opening15s?: unknown;
    valueHook?: unknown;
    evidenceMention?: unknown;
    ask?: unknown;
    objectionHandlers?: unknown;
    close?: unknown;
  };
};

function parsePhoneSections(raw: ProviderDraftJson['sections']): PhoneDraftSections | null {
  if (!raw || typeof raw !== 'object') return null;
  const opening15s = typeof raw.opening15s === 'string' ? raw.opening15s.trim() : '';
  const valueHook = typeof raw.valueHook === 'string' ? raw.valueHook.trim() : '';
  const evidenceMention = typeof raw.evidenceMention === 'string' ? raw.evidenceMention.trim() : '';
  const ask = typeof raw.ask === 'string' ? raw.ask.trim() : '';
  const close = typeof raw.close === 'string' ? raw.close.trim() : '';
  const objectionHandlers = Array.isArray(raw.objectionHandlers)
    ? raw.objectionHandlers
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim())
        .slice(0, 2)
    : [];
  if (!opening15s && !valueHook && !ask) return null;
  return {
    opening15s,
    valueHook,
    evidenceMention,
    ask,
    objectionHandlers,
    close,
  };
}

/** Gemini/OpenRouter sometimes wraps JSON in markdown fences or prose. */
export function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

export function parseDraftResponse(raw: string, channel: DraftChannel): ParsedDraft {
  let parsed: ProviderDraftJson;
  try {
    parsed = JSON.parse(extractJsonPayload(raw)) as ProviderDraftJson;
  } catch {
    throw new DraftGenerationError('Provider returned non-JSON draft content.', 'provider_failed');
  }
  const body = typeof parsed.body === 'string' ? parsed.body.trim() : '';
  if (!body) throw new DraftGenerationError('Provider returned an empty draft body.', 'provider_failed');

  const max =
    channel === 'whatsapp'
      ? 420
      : channel === 'follow_up'
        ? 700
        : channel === 'phone'
          ? 2400
          : 900;
  if (body.length > max + 120) {
    throw new DraftGenerationError('Provider draft exceeded length limits.', 'provider_failed');
  }

  const subject =
    typeof parsed.subject === 'string' && parsed.subject.trim()
      ? parsed.subject.trim().slice(0, 90)
      : null;
  if (channel === 'email' && !subject) {
    throw new DraftGenerationError('Email drafts require a subject.', 'provider_failed');
  }

  const phoneSections = channel === 'phone' ? parsePhoneSections(parsed.sections) : null;

  return {
    subject: channel === 'email' || channel === 'follow_up' ? subject : null,
    body: body.slice(0, max),
    phoneSections,
  };
}

async function callChatProvider(input: {
  provider: DraftProvider;
  apiKey: string;
  model: string;
  prompt: string;
  maxOutputTokens: number;
  fetchFn: typeof fetch;
}): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DRAFT_TIMEOUT_MS);
  try {
    if (input.provider === 'anthropic') {
      const res = await input.fetchFn(ANTHROPIC_CHAT_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'x-api-key': input.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: input.model,
          max_tokens: input.maxOutputTokens,
          temperature: 0.3,
          system:
            'You write evidence-bound outreach drafts for a web agency. Respond with valid JSON only.',
          messages: [{ role: 'user', content: input.prompt }],
        }),
      });
      if (!res.ok) {
        throw new DraftGenerationError(`Anthropic draft request failed (${res.status}).`, 'provider_failed');
      }
      const data = (await res.json()) as { content?: Array<{ text?: string }> };
      const text = data.content?.map((part) => part.text ?? '').join('').trim();
      if (!text) throw new DraftGenerationError('Anthropic returned empty content.', 'provider_failed');
      return text;
    }

    const url = input.provider === 'openai' ? OPENAI_CHAT_URL : OPENROUTER_CHAT_URL;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    };
    if (input.provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://lead-discovery.local';
      headers['X-Title'] = 'Lead Discovery OS Drafts';
    }
    // Gemini 2.5 Pro requires reasoning and bills it against max_tokens.
    // Keep a large completion budget so the JSON draft is not truncated mid-object.
    const openRouterCompletionTokens =
      input.provider === 'openrouter'
        ? Math.max(input.maxOutputTokens + 5000, 8000)
        : input.maxOutputTokens;
    const requestBody: Record<string, unknown> = {
      model: input.model,
      temperature: 0.3,
      max_tokens: openRouterCompletionTokens,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You write evidence-bound outreach drafts for a web agency. Respond with valid JSON only.',
        },
        { role: 'user', content: input.prompt },
      ],
    };
    if (input.provider === 'openrouter') {
      // Hide CoT in the message content; do not send effort:"none" (rejected as mandatory).
      requestBody.reasoning = { exclude: true };
    }
    const res = await input.fetchFn(url, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify(requestBody),
    });
    if (!res.ok) {
      const errText = await res.text();
      logger.warn('Draft provider request failed', {
        provider: input.provider,
        status: res.status,
        err: errText.slice(0, 300),
      });
      throw new DraftGenerationError(
        `${input.provider} draft request failed (${res.status}).`,
        'provider_failed',
      );
    }
    const data = (await res.json()) as {
      choices?: Array<{
        message?: { content?: string };
        finish_reason?: string;
      }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new DraftGenerationError('Provider returned empty content.', 'provider_failed');
    if (data.choices?.[0]?.finish_reason === 'length') {
      logger.warn('Draft provider hit max_tokens; content may be truncated', {
        provider: input.provider,
        model: input.model,
        preview: content.slice(0, 80),
      });
    }
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function assertCaseFileReady(caseFile: CaseFile): void {
  const hasIntel =
    caseFile.weaknesses.length > 0 ||
    caseFile.pains.length > 0 ||
    Boolean(caseFile.pitchAngle?.trim());
  if (!hasIntel) {
    throw new DraftGenerationError(
      'Case File has no evidence-backed weaknesses, pains, or pitch angle yet.',
      'invalid_fact_pack',
    );
  }
}

export async function getCachedDraft(leadId: string, channel: DraftChannel) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(outreachDrafts)
    .where(and(eq(outreachDrafts.leadId, leadId), eq(outreachDrafts.channel, channel)))
    .orderBy(desc(outreachDrafts.updatedAt))
    .limit(1);
  return row ?? null;
}

function phoneSectionsFromStoredFactPack(factPack: Record<string, unknown>): PhoneDraftSections | null {
  const sections = factPack.phoneSections;
  if (!sections || typeof sections !== 'object') return null;
  return sections as PhoneDraftSections;
}

export async function generateOutreachDraft(input: {
  leadId: string;
  accountId?: string;
  channel: DraftChannel;
  /** @deprecated Prefer caseFile */
  pitchPack?: DraftSource;
  caseFile?: DraftSource;
  regenerate?: boolean;
  operatorId?: string;
  fetchFn?: typeof fetch;
}): Promise<OutreachDraftRecord> {
  await platformSettings.ensureLoaded();
  const settings = platformSettings.getSync();
  const draftSettings = settings.drafts;
  const source = input.caseFile ?? input.pitchPack;
  if (!source) {
    throw new DraftGenerationError('Case File is required for draft generation.', 'invalid_fact_pack');
  }
  const caseFile = toCaseFile(source);

  if (!draftSettings.enabled) {
    throw new DraftGenerationError('Outreach draft generation is disabled in settings.', 'disabled');
  }

  if (caseFile.status === 'blocked') {
    throw new DraftGenerationError(
      'This account is suppressed — outreach drafts are blocked.',
      'account_suppressed',
    );
  }

  if (input.accountId) {
    const accounts = new AccountService();
    const account = await accounts.getById(input.accountId);
    if (account && (await accounts.isSuppressed(account))) {
      throw new DraftGenerationError(
        'This account is suppressed — outreach drafts are blocked.',
        'account_suppressed',
      );
    }
  }

  if (input.channel === 'whatsapp') {
    const status = caseFile.contact.whatsapp.status;
    if (status === 'wa_blocked' || status === 'wa_unreliable') {
      throw new DraftGenerationError(
        `WhatsApp draft blocked: number screening status is ${status}.`,
        'whatsapp_ineligible',
      );
    }
  }

  if (input.channel === 'phone') {
    if (!caseFile.contact.phone?.trim()) {
      throw new DraftGenerationError(
        'Phone draft requires a phone number on the Case File.',
        'phone_ineligible',
      );
    }
  }

  assertCaseFileReady(caseFile);

  const factPack = buildDraftFactPack(caseFile, input.channel);
  const factPackHash = hashFactPack(factPack);
  const existing = await getCachedDraft(input.leadId, input.channel);

  if (existing && !input.regenerate) {
    return {
      id: existing.id,
      leadId: existing.leadId,
      channel: existing.channel as DraftChannel,
      subject: existing.subject,
      body: existing.body,
      factPackHash: existing.factPackHash,
      provider: existing.provider,
      model: existing.model,
      regenerated: existing.regenerated,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
      cached: true,
      phoneSections: phoneSectionsFromStoredFactPack(existing.factPack),
    };
  }

  const provider = draftSettings.provider;
  const credentialKey = CREDENTIAL_BY_PROVIDER[provider];
  const apiKey = platformSettings.getCredential(credentialKey);
  if (!apiKey) {
    throw new DraftGenerationError(
      `Missing ${credentialKey.replace(/_/g, ' ')} for draft provider ${provider}. Configure it in Settings.`,
      'missing_credentials',
    );
  }

  const budget = new BudgetGovernor();
  try {
    await budget.assertCanSpend('llm_draft', 1);
  } catch (error) {
    if (error instanceof BudgetExhaustedError) {
      throw new DraftGenerationError(
        'Daily llm_draft budget exhausted. Raise the cap in Settings or try tomorrow.',
        'budget_exhausted',
      );
    }
    throw error;
  }

  const prompt = buildDraftPrompt(factPack);
  const raw = await callChatProvider({
    provider,
    apiKey,
    model: draftSettings.model,
    prompt,
    maxOutputTokens: draftSettings.maxOutputTokens,
    fetchFn: input.fetchFn ?? fetch,
  });
  const parsed = parseDraftResponse(raw, input.channel);

  const factPackToStore: DraftFactPack = {
    ...factPack,
    phoneSections: parsed.phoneSections ?? null,
  };

  await budget.recordSpend({
    provider: 'llm_draft',
    operation: `${input.channel}_draft`,
    units: 1,
    accountId: input.accountId,
  });

  const db = getDb();
  if (existing) {
    const [updated] = await db
      .update(outreachDrafts)
      .set({
        subject: parsed.subject,
        body: parsed.body,
        factPackHash,
        factPack: factPackToStore,
        provider,
        model: draftSettings.model,
        regenerated: true,
        updatedAt: new Date(),
      })
      .where(eq(outreachDrafts.id, existing.id))
      .returning();
    return {
      id: updated.id,
      leadId: updated.leadId,
      channel: updated.channel as DraftChannel,
      subject: updated.subject,
      body: updated.body,
      factPackHash: updated.factPackHash,
      provider: updated.provider,
      model: updated.model,
      regenerated: updated.regenerated,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      cached: false,
      phoneSections: parsed.phoneSections ?? null,
    };
  }

  const [created] = await db
    .insert(outreachDrafts)
    .values({
      leadId: input.leadId,
      channel: input.channel,
      subject: parsed.subject,
      body: parsed.body,
      factPackHash,
      factPack: factPackToStore,
      provider,
      model: draftSettings.model,
      regenerated: false,
    })
    .returning();

  return {
    id: created.id,
    leadId: created.leadId,
    channel: created.channel as DraftChannel,
    subject: created.subject,
    body: created.body,
    factPackHash: created.factPackHash,
    provider: created.provider,
    model: created.model,
    regenerated: created.regenerated,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    cached: false,
    phoneSections: parsed.phoneSections ?? null,
  };
}

export async function getDraftBudgetStatus() {
  await platformSettings.ensureLoaded();
  const budget = new BudgetGovernor();
  return budget.getProviderSummary('llm_draft');
}
