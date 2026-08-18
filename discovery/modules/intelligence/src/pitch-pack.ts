import { buildCaseFile, type CaseFileWebsiteBrief, type PursuitContext } from './case-file';
import type { BusinessIntelligenceProfile } from './bi/types';
import type { WhatsAppScreening } from './contact-screening';

export type { CaseFileWebsiteBrief as WebsiteBrief, PursuitContext };

/** @deprecated Prefer CaseFile from ./case-file — slim v1 shape for backward compatibility */
export type PitchPack = {
  version: 1;
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
  weaknesses: Array<{
    id: string;
    label: string;
    severity: 'high' | 'medium' | 'info';
    evidenceIds: string[];
  }>;
  pitchAngle: string | null;
  recommendedServices: string[];
  evidence: Array<{ id: string; label: string; excerpt: string | null; url: string | null }>;
  contact: {
    email: string | null;
    phone: string | null;
    whatsappUrl: string | null;
    whatsapp: WhatsAppScreening;
  };
};

export function buildPitchPack(input: {
  profile: BusinessIntelligenceProfile | null;
  websiteBrief: CaseFileWebsiteBrief | null;
  pursuitContext?: PursuitContext | null;
  suppressed?: boolean;
}): PitchPack | null {
  const caseFile = buildCaseFile(input);
  if (!caseFile) return null;

  return {
    version: 1,
    status: caseFile.status === 'blocked' ? 'blocked' : caseFile.status,
    identity: caseFile.identity,
    presence: caseFile.presence,
    score: caseFile.score,
    reachability: caseFile.reachability,
    weaknesses: caseFile.weaknesses.slice(0, 3),
    pitchAngle: caseFile.pitchAngle,
    recommendedServices: caseFile.recommendedServices,
    evidence: caseFile.evidence,
    contact: caseFile.contact,
  };
}
