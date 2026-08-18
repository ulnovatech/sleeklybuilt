import { requireOperator } from '@/lib/api-auth';
import {
  platformSettings,
  listAgencyPresets,
  type AcquisitionMode,
  type AcquisitionSettings,
  type AgencySettings,
  type CrawlSettings,
  type CredentialKey,
  type DiscoveryOptionsSettings,
  type IntentSettings,
  type LocaleSettings,
  type QualificationSettings,
  type CrmSettings,
  type BoiSettings,
  type DraftSettings,
  type MarketHunterSettings,
  CREDENTIAL_ENV_MAP,
} from '@agency/settings';
import { BudgetGovernor } from '@agency/acquisition';
import { classifyCseCredential } from '@agency/discovery';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const acquisitionPatchSchema = z
  .object({
    mode: z.enum(['economy', 'standard', 'boost']).optional(),
    caps: z
      .object({
        google_places: z.number().int().min(0).optional(),
        google_cse: z.number().int().min(0).optional(),
        bing_search: z.number().int().min(0).optional(),
        browser_automation: z.number().int().min(0).optional(),
        custom_scrape: z.number().int().min(0).optional(),
        meta_graph: z.number().int().min(0).optional(),
        llm_narrative: z.number().int().min(0).optional(),
        llm_draft: z.number().int().min(0).optional(),
      })
      .optional(),
    searchLimits: z
      .object({
        economy: z.number().int().min(1).optional(),
        standard: z.number().int().min(1).optional(),
        boost: z.number().int().min(1).optional(),
      })
      .optional(),
    metaGraphLimits: z
      .object({
        economy: z.number().int().min(1).optional(),
        standard: z.number().int().min(1).optional(),
        boost: z.number().int().min(1).optional(),
      })
      .optional(),
    socialSearchLimits: z
      .object({
        economy: z.number().int().min(1).optional(),
        standard: z.number().int().min(1).optional(),
        boost: z.number().int().min(1).optional(),
      })
      .optional(),
    placesTtlDays: z.number().int().min(1).optional(),
    enrichmentStaleAfterDays: z.number().int().min(1).max(365).optional(),
    places: z
      .object({
        standardVerifyMaxPerRun: z.number().int().min(0).optional(),
        boostVerifyMaxPerRun: z.number().int().min(0).optional(),
        detailsTopN: z.number().int().min(0).optional(),
        detailsMinScore: z.number().int().min(0).optional(),
      })
      .optional(),
  })
  .optional();

const discoveryPatchSchema = z
  .object({
    countries: z.array(z.string().min(1)).optional(),
    industries: z.array(z.string().min(1)).optional(),
    citiesByCountry: z.record(z.array(z.string().min(1))).optional(),
    allCitiesLabel: z.string().min(1).optional(),
    defaults: z
      .object({
        country: z.string().min(1).optional(),
        city: z.string().min(1).optional(),
        industry: z.string().min(1).optional(),
      })
      .optional(),
    csvImportPath: z.string().min(1).optional(),
  })
  .optional();

const crawlPatchSchema = z
  .object({
    enabled: z.boolean().optional(),
    maxPagesPerAccount: z.number().int().min(1).max(10).optional(),
    rateLimitMsPerDomain: z.number().int().min(0).optional(),
    fetchTimeoutMs: z.number().int().min(1000).optional(),
    extraPaths: z.array(z.string().min(1)).optional(),
    contactLinkKeywords: z.array(z.string().min(1)).optional(),
    aboutLinkKeywords: z.array(z.string().min(1)).optional(),
    userAgent: z.string().min(1).optional(),
    trackBudget: z.boolean().optional(),
  })
  .optional();

const localePackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  languageCode: z.string().optional(),
  markets: z.array(z.string()),
  contactTokens: z.array(z.object({ token: z.string(), weight: z.number().optional() })),
  aboutTokens: z.array(z.object({ token: z.string(), weight: z.number().optional() })),
  negativeTokens: z.array(z.object({ token: z.string(), weight: z.number().optional() })),
  enabled: z.boolean(),
  notes: z.string().optional(),
  source: z.string().optional(),
});

const localesPatchSchema = z
  .object({
    useBuiltinLexicon: z.boolean().optional(),
    packs: z.array(localePackSchema).optional(),
  })
  .optional();

const intentPatchSchema = z
  .object({
    demandRssFeeds: z.array(z.string().max(1000)).max(3).optional(),
  })
  .optional();

const qualificationPatchSchema = z
  .object({
    requireContactForReview: z.boolean().optional(),
    minScoreDefault: z.number().int().min(0).max(100).optional(),
    icp: z
      .object({
        requireWebsiteOpportunity: z.boolean().optional(),
        demandWeightMultiplier: z.number().min(0).max(5).optional(),
        minReachabilityForExport: z.enum(['low', 'medium', 'high']).optional(),
      })
      .optional(),
  })
  .optional();

const crmPatchSchema = z
  .object({
    followUpDaysAfterContact: z.number().int().min(1).max(90).optional(),
  })
  .optional();

const boiPatchSchema = z
  .object({
    llmNarrativeEnabled: z.boolean().optional(),
    llmModel: z.string().min(1).max(100).optional(),
  })
  .optional();

const draftsPatchSchema = z
  .object({
    enabled: z.boolean().optional(),
    provider: z.enum(['openrouter', 'openai', 'anthropic']).optional(),
    model: z.string().min(1).max(120).optional(),
    maxOutputTokens: z.number().int().min(100).max(4000).optional(),
  })
  .optional();

const marketHunterPlatformSchema = z
  .object({
    codecanyon: z.boolean().optional(),
    getly: z.boolean().optional(),
    gumroad: z.boolean().optional(),
    producthunt: z.boolean().optional(),
    g2: z.boolean().optional(),
    reddit: z.boolean().optional(),
  })
  .optional();

const marketHunterLlmSchema = z
  .object({
    researchProvider: z.enum(['openrouter', 'xai']).optional(),
    researchModel: z.string().min(1).max(120).optional(),
    complaintsProvider: z.enum(['openrouter', 'anthropic']).optional(),
    complaintsModel: z.string().min(1).max(120).optional(),
  })
  .optional();

const marketHunterCostSchema = z
  .object({
    researchListingCallUsd: z.number().min(0).max(5).optional(),
    researchReviewsCallUsd: z.number().min(0).max(5).optional(),
    complaintAnalysisCallUsd: z.number().min(0).max(5).optional(),
  })
  .optional();

const marketHunterCategoriesSchema = z
  .record(z.string(), z.array(z.string().min(1).max(120)).max(30))
  .optional();

const marketHunterPatchSchema = z
  .object({
    enabled: z.boolean().optional(),
    maxSpendPerRunUsd: z.number().min(0).max(50).optional(),
    defaultListingLimit: z.number().int().min(1).max(100).optional(),
    scheduleCron: z.string().min(1).max(100).optional(),
    platforms: marketHunterPlatformSchema,
    platformCategories: marketHunterCategoriesSchema,
    llm: marketHunterLlmSchema,
    costEstimates: marketHunterCostSchema,
    paymentPath: z.string().min(1).max(500).optional(),
  })
  .optional();

const credentialsPatchSchema = z.record(z.string()).optional();

const agencyPackageSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  priceUgx: z.number().int().min(0),
  depositUgx: z.number().int().min(0).optional(),
  badge: z.string().max(40).nullable().optional(),
  band: z.enum(['starter', 'growth', 'premium']).optional(),
  description: z.string().max(500).optional(),
});

const agencyServiceSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  mapsToSolutionId: z.string().max(80).optional(),
  description: z.string().max(500).optional(),
});

const agencyPatchSchema = z
  .object({
    presetId: z.enum(['generic', 'sleeklybuilt', 'custom']).optional(),
    brandName: z.string().max(200).optional(),
    legalName: z.string().max(200).optional(),
    tagline: z.string().max(500).optional(),
    currency: z.literal('UGX').optional(),
    email: z.string().max(200).optional(),
    phone: z.string().max(80).optional(),
    location: z.string().max(200).optional(),
    senderName: z.string().max(200).optional(),
    signature: z.string().max(2000).optional(),
    packages: z.array(agencyPackageSchema).max(50).optional(),
    services: z.array(agencyServiceSchema).max(100).optional(),
  })
  .optional();

const patchSchema = z.object({
  acquisition: acquisitionPatchSchema,
  discovery: discoveryPatchSchema,
  crawl: crawlPatchSchema,
  locales: localesPatchSchema,
  intent: intentPatchSchema,
  qualification: qualificationPatchSchema,
  crm: crmPatchSchema,
  boi: boiPatchSchema,
  drafts: draftsPatchSchema,
  marketHunter: marketHunterPatchSchema,
  agency: agencyPatchSchema,
  credentials: credentialsPatchSchema,
});

const CREDENTIAL_LABELS: Record<CredentialKey, string> = {
  google_places_api_key: 'Google Places API Key (required for factory harvest)',
  google_places_api_keys: 'Google Places API Keys (comma-separated rotation; factory required)',
  google_cse_api_key: 'Google Custom Search API Key (optional overlay)',
  google_cse_cx: 'Google Custom Search Engine ID / CX (optional overlay)',
  bing_search_key: 'Bing Search API Key',
  meta_graph_api_token: 'Meta Graph API Token',
  gmail_oauth_client_id: 'Gmail OAuth Client ID',
  gmail_oauth_client_secret: 'Gmail OAuth Client Secret',
  gmail_oauth_refresh_token: 'Gmail OAuth Refresh Token (set via Connect)',
  openai_api_key: 'OpenAI API Key (BOI narrative + drafts)',
  openrouter_api_key: 'OpenRouter API Key (Gemini pitches + Market Hunter)',
  xai_grok_api_key: 'xAI Grok API Key (Market Hunter direct research)',
  anthropic_api_key: 'Anthropic API Key (drafts + Market Hunter complaints)',
  sleekly_dash_base_url: 'SleeklyBuilt CRM base URL (sleekly-dash)',
  sleekly_dash_service_token: 'SleeklyBuilt CRM service token',
};

async function readDraftBudget() {
  try {
    return await new BudgetGovernor().getProviderSummary('llm_draft');
  } catch {
    return null;
  }
}

function factoryCredentialHint(key: CredentialKey, configured: boolean, cseReason?: string): string | undefined {
  if (key === 'google_places_api_key' || key === 'google_places_api_keys') {
    return configured
      ? 'Primary harvest source for Factory A/B'
      : 'Required for factory harvest — paste a Places API (New) key';
  }
  if ((key === 'google_cse_api_key' || key === 'google_cse_cx') && cseReason) {
    return cseReason;
  }
  return undefined;
}

export async function GET() {
  try {
    const settings = await platformSettings.ensureLoaded();
    const credentialStatuses = platformSettings.getCredentialStatuses(settings);
    const draftBudget = await readDraftBudget();
    const cse = classifyCseCredential(
      platformSettings.getCredential('google_cse_api_key'),
      platformSettings.getCredential('google_cse_cx'),
    );

    return NextResponse.json({
      acquisition: settings.acquisition,
      discovery: settings.discovery,
      crawl: settings.crawl,
      locales: settings.locales,
      intent: settings.intent,
      qualification: settings.qualification,
      crm: settings.crm,
      boi: settings.boi,
      drafts: settings.drafts,
      draftBudget,
      marketHunter: settings.marketHunter,
      agency: settings.agency,
      agencyPresets: listAgencyPresets(),
      credentials: (Object.keys(CREDENTIAL_ENV_MAP) as CredentialKey[]).map((key) => {
        const status = credentialStatuses.find((s) => s.key === key);
        const configured = status?.configured ?? false;
        const factoryHint = factoryCredentialHint(key, configured, cse.ready ? undefined : cse.reason);
        return {
          key,
          label: CREDENTIAL_LABELS[key],
          envVar: CREDENTIAL_ENV_MAP[key],
          configured,
          source: status?.source ?? 'none',
          hint: [status?.hint, factoryHint].filter(Boolean).join(' · ') || undefined,
          hasStoredValue: !!settings.credentials[key]?.trim(),
        };
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { acquisition, discovery, crawl, locales, intent, qualification, crm, boi, drafts, marketHunter, agency, credentials } =
      parsed.data;

    if (acquisition) {
      await platformSettings.updateAcquisition(acquisition as Partial<AcquisitionSettings>);
    }
    if (discovery) {
      await platformSettings.updateDiscovery(discovery as Partial<DiscoveryOptionsSettings>);
    }
    if (crawl) {
      await platformSettings.updateCrawl(crawl as Partial<CrawlSettings>);
    }
    if (locales) {
      await platformSettings.updateLocales(locales as Partial<LocaleSettings>);
    }
    if (intent) {
      const feeds = (intent.demandRssFeeds ?? []).map((u) => u.trim()).filter(Boolean);
      await platformSettings.updateIntent({ demandRssFeeds: feeds } as Partial<IntentSettings>);
    }
    if (qualification) {
      await platformSettings.updateQualification(qualification as Partial<QualificationSettings>);
    }
    if (crm) {
      await platformSettings.updateCrm(crm as Partial<CrmSettings>);
    }
    if (boi) {
      await platformSettings.updateBoi(boi as Partial<BoiSettings>);
    }
    if (drafts) {
      await platformSettings.updateDrafts(drafts as Partial<DraftSettings>);
    }
    if (marketHunter) {
      await platformSettings.updateMarketHunter(marketHunter as Partial<MarketHunterSettings>);
    }
    if (agency) {
      await platformSettings.updateAgency(agency as Partial<AgencySettings>);
    }
    if (credentials) {
      await platformSettings.updateCredentials(credentials as Partial<Record<CredentialKey, string>>);
    }

    platformSettings.invalidate();
    const settings = await platformSettings.ensureLoaded();

    return NextResponse.json({
      acquisition: settings.acquisition,
      discovery: settings.discovery,
      crawl: settings.crawl,
      locales: settings.locales,
      intent: settings.intent,
      qualification: settings.qualification,
      crm: settings.crm,
      boi: settings.boi,
      drafts: settings.drafts,
      marketHunter: settings.marketHunter,
      agency: settings.agency,
      acquisitionMode: settings.acquisition.mode as AcquisitionMode,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
