/**
 * Final Pitch Today keeper gate — stricter than promote/export.
 * Requires confirmed_greenfield + phone + additional usable channel + fresh proof.
 */

import {
  isProspectProofFresh,
  readProspectProof,
  resolveEffectiveGreenfieldStatus,
  type ContactChannelEvidence,
  type ProspectProof,
} from './prospect-evidence';

export type PitchTodayContactInput = {
  phone?: string | null;
  email?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type PitchTodayEligibility = {
  eligible: boolean;
  reason: string;
  greenfieldStatus: ReturnType<typeof resolveEffectiveGreenfieldStatus>;
  hasPhone: boolean;
  hasAdditionalChannel: boolean;
};

function contactsFromProof(proof: ProspectProof | undefined): ContactChannelEvidence[] {
  return proof?.contacts ?? [];
}

export function hasUsablePhone(input: PitchTodayContactInput): boolean {
  if (input.phone?.trim()) return true;
  return contactsFromProof(readProspectProof(input.metadata)).some(
    (c) => c.channel === 'phone' && c.value.trim() && c.verified,
  );
}

/** Additional channel beyond phone: email, evidenced social, or WhatsApp-ready. */
export function hasAdditionalContactChannel(input: PitchTodayContactInput): boolean {
  if (input.email?.trim()) return true;
  if (input.facebookUrl?.trim() || input.instagramUrl?.trim() || input.youtubeUrl?.trim()) {
    return true;
  }
  const contacts = contactsFromProof(readProspectProof(input.metadata));
  return contacts.some((c) => {
    if (!c.value.trim()) return false;
    if (c.channel === 'email' && c.verified) return true;
    if (c.channel === 'whatsapp' && c.verified) return true;
    if (
      (c.channel === 'facebook' ||
        c.channel === 'instagram' ||
        c.channel === 'youtube' ||
        c.channel === 'other_social') &&
      c.identityMatch !== 'weak'
    ) {
      return true;
    }
    return false;
  });
}

export function evaluatePitchTodayEligibility(
  input: PitchTodayContactInput,
  now = new Date(),
): PitchTodayEligibility {
  const greenfieldStatus = resolveEffectiveGreenfieldStatus(input.metadata, now);
  const proof = readProspectProof(input.metadata);
  const hasPhone = hasUsablePhone(input);
  const hasAdditionalChannel = hasAdditionalContactChannel(input);

  if (greenfieldStatus === 'existing_website') {
    return {
      eligible: false,
      reason: 'Existing owned website — exclude from no-website Pitch Today',
      greenfieldStatus,
      hasPhone,
      hasAdditionalChannel,
    };
  }
  if (greenfieldStatus !== 'confirmed_greenfield') {
    return {
      eligible: false,
      reason: 'Website search incomplete or uncertain — not confirmed greenfield',
      greenfieldStatus,
      hasPhone,
      hasAdditionalChannel,
    };
  }
  if (!proof || !isProspectProofFresh(proof, now)) {
    return {
      eligible: false,
      reason: 'Greenfield evidence missing or stale — re-probe required',
      greenfieldStatus: 'uncertain',
      hasPhone,
      hasAdditionalChannel,
    };
  }
  if (proof.searchCompletion !== 'complete') {
    return {
      eligible: false,
      reason: 'Website search completion contract not met',
      greenfieldStatus: 'uncertain',
      hasPhone,
      hasAdditionalChannel,
    };
  }
  if (!hasPhone) {
    return {
      eligible: false,
      reason: 'No usable phone for Pitch Today',
      greenfieldStatus,
      hasPhone,
      hasAdditionalChannel,
    };
  }
  if (!hasAdditionalChannel) {
    return {
      eligible: false,
      reason: 'Phone-only — need email, evidenced social, or WhatsApp-ready contact',
      greenfieldStatus,
      hasPhone,
      hasAdditionalChannel,
    };
  }

  return {
    eligible: true,
    reason: 'Confirmed greenfield with phone and additional contact channel',
    greenfieldStatus,
    hasPhone,
    hasAdditionalChannel,
  };
}
