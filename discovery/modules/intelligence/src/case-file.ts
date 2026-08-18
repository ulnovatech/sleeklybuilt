import {
  computeReachability,
  hasRealWebsite,
  isLinkInBioWebsite,
  isValidEmailFormat,
  type OpportunityType,
} from '@agency/scoring';
import type {
  BoIDigitalGap,
  BoIProjectValueEstimate,
  BoIPurchaseReadiness,
  BoISentimentSummary,
  BoISolution,
  BoIStructuredPain,
  BoITechStack,
} from './boi/types';
import { readBoiFromProfile } from './boi/boi-repository';
import type { BusinessIntelligenceProfile } from './bi/types';
import { screenWhatsAppNumber, type WhatsAppScreening } from './contact-screening';

export type CaseFileWebsiteBrief = {
  opportunityType?: OpportunityType;
  pitchAngle?: string;
  websiteGaps?: Array<{ key: string; label: string; severity: 'high' | 'medium' | 'info' }>;
  positiveFactors?: Array<{ key: string; label: string; value: number }>;
  score?: number | null;
  reachability?: string | null;
};

export type CaseFileWeakness = {
  id: string;
  label: string;
  severity: 'high' | 'medium' | 'info';
  evidenceIds: string[];
};

export type CaseFilePain = {
  id: string;
  label: string;
  confidence: number;
  evidenceIds: string[];
};

export type CaseFileEvidence = {
  id: string;
  label: string;
  excerpt: string | null;
  url: string | null;
};

export type CaseFileSentiment = {
  overallRating: number | null;
  reviewCount: number;
  complaintThemes: Array<{
    id: string;
    label: string;
    mentionCount: number;
    sampleExcerpt: string | null;
  }>;
  praiseThemes: Array<{
    id: string;
    label: string;
    mentionCount: number;
    sampleExcerpt: string | null;
  }>;
};

export type CaseFileWebsiteGap = {
  key: string;
  label: string;
  severity: 'high' | 'medium' | 'info';
};

export type PursuitContext = {
  leadId: string | null;
  status: string | null;
  lastOutreach: {
    channel: string;
    subject: string | null;
    body: string | null;
    sentAt: string;
  } | null;
  nextFollowUpAt: string | null;
};

export type CaseFile = {
  version: 2;
  status: 'ready' | 'partial' | 'processing' | 'blocked';
  identity: {
    businessId: string;
    name: string;
    industry: string | null;
    city: string | null;
    country: string | null;
  };
  presence: {
    class: 'greenfield' | 'social_only' | 'link_in_bio' | 'redesign';
    website: string | null;
  };
  score: number | null;
  reachability: string | null;
  weaknesses: CaseFileWeakness[];
  pains: CaseFilePain[];
  pitchAngle: string | null;
  executiveSummary: string | null;
  recommendedServices: string[];
  purchaseReadiness: BoIPurchaseReadiness | null;
  solutions: BoISolution[];
  sentiment: CaseFileSentiment | null;
  websiteGaps: CaseFileWebsiteGap[];
  techStack: BoITechStack | null;
  projectValue: BoIProjectValueEstimate | null;
  evidence: CaseFileEvidence[];
  pursuitContext: PursuitContext | null;
  contact: {
    email: string | null;
    phone: string | null;
    whatsappUrl: string | null;
    whatsapp: WhatsAppScreening;
  };
};

const WEAKNESS_LIMIT = 8;
const SEVERITY_RANK: Record<CaseFileWeakness['severity'], number> = {
  high: 0,
  medium: 1,
  info: 2,
};

function gapToWeakness(gap: BoIDigitalGap): CaseFileWeakness {
  return {
    id: gap.id,
    label: gap.label,
    severity: gap.severity === 'low' ? 'info' : gap.severity,
    evidenceIds: gap.evidenceIds,
  };
}

function sortWeaknesses(items: CaseFileWeakness[]): CaseFileWeakness[] {
  return [...items].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

function mapPains(pains: BoIStructuredPain[]): CaseFilePain[] {
  return pains.map((pain) => ({
    id: pain.id,
    label: pain.label,
    confidence: pain.confidence,
    evidenceIds: pain.evidenceIds,
  }));
}

function mapSentiment(summary: BoISentimentSummary | null | undefined): CaseFileSentiment | null {
  if (!summary) return null;
  return {
    overallRating: summary.overallRating ?? null,
    reviewCount: summary.reviewCount,
    complaintThemes: summary.complaintThemes.map((theme) => ({
      id: theme.id,
      label: theme.label,
      mentionCount: theme.mentionCount,
      sampleExcerpt: theme.sampleExcerpt ?? null,
    })),
    praiseThemes: summary.praiseThemes.map((theme) => ({
      id: theme.id,
      label: theme.label,
      mentionCount: theme.mentionCount,
      sampleExcerpt: theme.sampleExcerpt ?? null,
    })),
  };
}

function derivePresenceClass(profile: BusinessIntelligenceProfile): CaseFile['presence'] {
  const website = profile.contact.website ?? null;
  const realWebsite = hasRealWebsite({
    hasWebsite: profile.presence.hasWebsite,
    website,
    resolvedWebsiteFromBio:
      profile.digitalFootprint.linkInBioPages.find((page) => page.resolvedWebsite)?.resolvedWebsite ??
      null,
  });
  const socialOnly = !realWebsite && profile.digitalFootprint.socialLinks.length > 0;
  const linkInBio =
    Boolean(website && isLinkInBioWebsite(website)) ||
    profile.digitalFootprint.linkInBioPages.length > 0;
  const presenceClass = !realWebsite
    ? linkInBio
      ? 'link_in_bio'
      : socialOnly
        ? 'social_only'
        : 'greenfield'
    : 'redesign';
  return { class: presenceClass, website };
}

function deriveCaseFileStatus(input: {
  boiStatus: string | undefined;
  weaknessCount: number;
  painCount: number;
  pitchAngle: string | null;
  suppressed?: boolean;
}): CaseFile['status'] {
  if (input.suppressed) return 'blocked';
  if (input.boiStatus === 'ready') return 'ready';
  if (input.weaknessCount > 0 || input.painCount > 0 || input.pitchAngle) return 'partial';
  return 'processing';
}

export function buildCaseFile(input: {
  profile: BusinessIntelligenceProfile | null;
  websiteBrief: CaseFileWebsiteBrief | null;
  pursuitContext?: PursuitContext | null;
  suppressed?: boolean;
}): CaseFile | null {
  const { profile, websiteBrief, pursuitContext = null, suppressed = false } = input;
  if (!profile) return null;

  const boi = readBoiFromProfile(profile);
  const presence = derivePresenceClass(profile);
  const whatsappUrl =
    profile.digitalFootprint.socialLinks.find((link) => link.platform === 'whatsapp')?.url ?? null;

  const boiWeaknesses = sortWeaknesses((boi?.digitalGaps ?? []).map(gapToWeakness)).slice(
    0,
    WEAKNESS_LIMIT,
  );
  const fallbackWeaknesses = sortWeaknesses(
    (websiteBrief?.websiteGaps ?? []).map((gap) => ({
      id: gap.key,
      label: gap.label,
      severity: gap.severity,
      evidenceIds: [] as string[],
    })),
  ).slice(0, WEAKNESS_LIMIT);
  const weaknesses = boiWeaknesses.length ? boiWeaknesses : fallbackWeaknesses;

  const pains = mapPains(boi?.pains ?? []);
  const pitchAngle = boi?.salesBrief?.pitchAngle ?? websiteBrief?.pitchAngle ?? null;
  const evidence = (boi?.evidence ?? []).map((item) => ({
    id: item.id,
    label: item.label,
    excerpt: item.excerpt ?? null,
    url: item.url ?? null,
  }));

  const websiteGaps: CaseFileWebsiteGap[] = (websiteBrief?.websiteGaps ?? []).map((gap) => ({
    key: gap.key,
    label: gap.label,
    severity: gap.severity,
  }));

  const email = profile.contact.email ?? null;
  const phone = profile.contact.phone ?? null;
  const contactReachability = computeReachability({
    hasEmail: Boolean(email?.trim()),
    hasPhone: Boolean(phone?.trim()),
    emailValid: email?.trim() ? isValidEmailFormat(email) : undefined,
  });

  return {
    version: 2,
    status: deriveCaseFileStatus({
      boiStatus: boi?.status,
      weaknessCount: weaknesses.length,
      painCount: pains.length,
      pitchAngle,
      suppressed,
    }),
    identity: {
      businessId: profile.businessId,
      name: profile.identity.name,
      industry: profile.identity.industry ?? null,
      city: profile.identity.city ?? null,
      country: profile.identity.country ?? null,
    },
    presence,
    score: websiteBrief?.score ?? null,
    // Pursuit Case File uses contact-path reachability. Lead-score reachability is
    // forced to none once a CRM lead exists (alreadyContacted), which is wrong here.
    reachability: contactReachability,
    weaknesses,
    pains,
    pitchAngle,
    executiveSummary: boi?.salesBrief?.executiveSummary ?? null,
    recommendedServices: boi?.salesBrief?.recommendedServices ?? [],
    purchaseReadiness: boi?.purchaseReadiness ?? null,
    solutions: boi?.solutions ?? [],
    sentiment: mapSentiment(boi?.sentimentSummary),
    websiteGaps,
    techStack: boi?.techStack ?? null,
    projectValue: boi?.projectValue ?? null,
    evidence,
    pursuitContext,
    contact: {
      email,
      phone,
      whatsappUrl,
      whatsapp: screenWhatsAppNumber(
        phone,
        whatsappUrl,
        profile.identity.country ?? null,
      ),
    },
  };
}
