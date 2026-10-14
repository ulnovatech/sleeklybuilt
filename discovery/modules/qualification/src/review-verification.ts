import { sql } from 'drizzle-orm';

export type VerificationFilter = 'verified' | 'unverified' | 'all';

export type ProspectContactInput = {
  businessEmail?: string | null;
  businessPhone?: string | null;
  accountEmail?: string | null;
  accountPhone?: string | null;
  accountMetadata?: Record<string, unknown> | null;
};

/**
 * SQL fragment — requires `businesses` as `b` and `accounts` as `a`.
 * Contact verification = usable email or phone only.
 * Places ID / placesVerified alone do NOT establish verification.
 */
export const prospectVerifiedSql = sql`(
  NULLIF(trim(COALESCE(b.email, a.email, '')), '') IS NOT NULL
  OR NULLIF(trim(COALESCE(b.phone, a.phone, '')), '') IS NOT NULL
)`;

export function isProspectVerified(input: ProspectContactInput): boolean {
  const email = (input.businessEmail || input.accountEmail || '').trim();
  if (email.length > 0) return true;

  const phone = (input.businessPhone || input.accountPhone || '').trim();
  if (phone.length > 0) return true;

  return false;
}

export function canPromoteFromReview(input: {
  verified: boolean;
  reachability: string;
  hasEmail: boolean;
  hasPhone: boolean;
}): { allowed: boolean; reason?: string } {
  if (input.hasEmail || input.hasPhone) return { allowed: true };
  return {
    allowed: false,
    reason: 'No usable phone or email — Places ID alone is not enough to promote.',
  };
}

/** Export / CSV eligibility — same contact floor as promote. */
export function canExportProspect(input: {
  hasEmail: boolean;
  hasPhone: boolean;
}): { allowed: boolean; reason?: string } {
  if (input.hasEmail || input.hasPhone) return { allowed: true };
  return {
    allowed: false,
    reason: 'Export requires a usable phone or email.',
  };
}
