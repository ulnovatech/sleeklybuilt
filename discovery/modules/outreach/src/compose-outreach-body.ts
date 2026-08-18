/**
 * Prepends a BOI outreach opener and appends agency signature when present.
 */
export function composeOutreachBody(
  templateBody: string,
  opener?: string | null,
  signature?: string | null,
): string {
  let body = templateBody.trim();
  const lead = opener?.trim();
  if (lead && !body.startsWith(lead)) {
    body = `${lead}\n\n${body}`;
  }
  const sig = signature?.trim();
  if (sig && !body.includes(sig)) {
    body = `${body}\n\n${sig}`;
  }
  return body;
}

export type OpenerEvidenceRef = {
  id: string;
  label: string;
  excerpt?: string | null;
};

export type RecommendedOutreachEnrichment = {
  suggestedOpener: string | null;
  openerPainId: string | null;
  openerPainLabel: string | null;
  openerEvidence: OpenerEvidenceRef[];
};
