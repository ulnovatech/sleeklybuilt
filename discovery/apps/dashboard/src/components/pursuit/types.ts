export type CaseFilePresenceClass = 'greenfield' | 'social_only' | 'link_in_bio' | 'redesign';

export type WhatsAppScreeningUi = {
  status: 'wa_ready' | 'wa_probable' | 'wa_unreliable' | 'wa_blocked';
  normalizedPhone: string | null;
  reason: string;
  waMeUrl: string | null;
};

export type CaseFileUi = {
  version: 2;
  status: 'ready' | 'partial' | 'processing' | 'blocked';
  identity: {
    businessId: string;
    name: string;
    industry: string | null;
    city: string | null;
    country: string | null;
  };
  presence: { class: CaseFilePresenceClass; website: string | null };
  score: number | null;
  reachability: string | null;
  weaknesses: Array<{
    id: string;
    label: string;
    severity: 'high' | 'medium' | 'info';
    evidenceIds: string[];
  }>;
  pains: Array<{
    id: string;
    label: string;
    confidence: number;
    evidenceIds: string[];
  }>;
  pitchAngle: string | null;
  executiveSummary: string | null;
  recommendedServices: string[];
  purchaseReadiness: {
    score: number | null;
    band: 'high' | 'medium' | 'low' | 'unknown';
    factors: Array<{ key: string; label: string; weight: number }>;
  } | null;
  solutions: Array<{
    id: string;
    service: string;
    painIds: string[];
    benefits: Array<{ label: string }>;
  }>;
  sentiment: {
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
  } | null;
  websiteGaps: Array<{ key: string; label: string; severity: 'high' | 'medium' | 'info' }>;
  evidence: Array<{ id: string; label: string; excerpt: string | null; url: string | null }>;
  pursuitContext: {
    leadId: string | null;
    status: string | null;
    lastOutreach: {
      channel: string;
      subject: string | null;
      body: string | null;
      sentAt: string;
    } | null;
    nextFollowUpAt: string | null;
  } | null;
  contact: {
    email: string | null;
    phone: string | null;
    whatsappUrl: string | null;
    whatsapp: WhatsAppScreeningUi;
  };
};

export type CaseFileResponse = {
  caseFile: CaseFileUi | null;
  pitchPack?: unknown;
  state: string;
  message?: string;
  suppressed?: boolean;
  rulesOpener?: string | null;
};

export type DraftChannel = 'email' | 'whatsapp' | 'phone' | 'follow_up';

export const PRESENCE_LABELS: Record<CaseFilePresenceClass, string> = {
  greenfield: 'Greenfield',
  social_only: 'Social-only',
  link_in_bio: 'Link-in-bio',
  redesign: 'Redesign lane',
};

export type OutreachQueueItem = {
  leadId: string;
  status: string;
  priority: string;
  nextFollowUpAt: string | null;
  updatedAt: string;
  business: {
    id: string;
    name: string;
    city: string | null;
    industry: string | null;
  };
  presenceClass: CaseFilePresenceClass;
  score: number | null;
  reachability: string | null;
  topWeaknesses: string[];
  pitchAngle: string | null;
  caseFileStatus: 'ready' | 'partial' | 'processing' | 'blocked';
  channels: {
    email: boolean;
    phone: boolean;
    whatsapp: 'wa_ready' | 'wa_probable' | 'wa_unreliable' | 'wa_blocked' | 'none';
  };
  drafts: {
    email: boolean;
    whatsapp: boolean;
    phone: boolean;
    follow_up: boolean;
  };
  lastOutreach: {
    channel: string;
    subject: string | null;
    sentAt: string;
  } | null;
  suppressed: boolean;
};

export type OutreachQueueResponse = {
  items: OutreachQueueItem[];
  total: number;
  page: number;
  limit: number;
  ownerScope: string;
};
