import type { AgencyProductLine, AgencyProductLineId } from '@agency/settings';

/** Router product lines — includes composites that resolve to a catalog path. */
export type SelectedOfferProductLine =
  | AgencyProductLineId
  | 'app_plus_site'
  | 'website_modules';

export type SelectedOffer = {
  productLine: SelectedOfferProductLine;
  label: string;
  url: string;
  packageId: string | null;
  why: string;
  matchedGapIds: string[];
  matchedPainIds: string[];
  ask: string;
};

export type ResolveSelectedOfferInput = {
  status?: 'ready' | 'partial' | 'processing' | 'blocked' | null;
  /** Enum id (`greenfield`) or sales-brief label (`Greenfield site`). */
  opportunityType?: string | null;
  presenceClass: 'greenfield' | 'social_only' | 'link_in_bio' | 'redesign';
  hasPhone?: boolean;
  hasEmail?: boolean;
  industry?: string | null;
  businessName?: string | null;
  painIds?: string[];
  gapIds?: string[];
  /** Intent titles/snippets for app/system language detection. */
  intentTexts?: string[];
  siteUrl?: string | null;
  productLines?: AgencyProductLine[];
};

type IndustryHint = 'simple_local' | 'multi_page' | 'commerce' | 'ops_heavy' | 'app_likely';

const DEFAULT_SITE_URL = 'https://sleeklybuilt.pro';

const DEFAULT_PRODUCT_LINES: AgencyProductLine[] = [
  { id: 'sleek_pages', label: 'Sleek Page', path: '/sleek-pages' },
  { id: 'websites', label: 'Website', path: '/websites' },
  { id: 'mobile_apps', label: 'Mobile app', path: '/mobile-apps' },
  { id: 'business_systems', label: 'Business system', path: '/business-systems' },
];

const HINT_KEYWORDS: Record<IndustryHint, string[]> = {
  simple_local: [
    'salon',
    'barber',
    'cafe',
    'café',
    'restaurant',
    'church',
    'clinic',
    'boutique',
    'spa',
    'gym',
    'dentist',
  ],
  multi_page: [
    'hotel',
    'school',
    'ngo',
    'law',
    'legal',
    'real estate',
    'realty',
    'agency',
    'university',
    'hospital',
  ],
  commerce: ['shop', 'store', 'supermarket', 'pharmacy', 'retail', 'boutique shop'],
  ops_heavy: ['sacco', 'logistics', 'inventory', 'pos', 'hr ', 'fleet', 'warehouse', 'payroll'],
  app_likely: [
    'delivery',
    'marketplace',
    'fintech',
    'booking platform',
    'ride',
    'android',
    'ios app',
    'mobile app',
  ],
};

const APP_INTENT_RE =
  /\b(android|ios|mobile\s*app|momo\s*app|app\s*for|build\s*(an?\s+)?app|react\s*native|flutter)\b/i;

const OPS_INTENT_RE =
  /\b(sacco|inventory|pos\b|payroll|crm\s*system|business\s*system|operations?\s*software)\b/i;

function normalizeSiteUrl(raw: string | null | undefined): string {
  const trimmed = (raw ?? '').trim().replace(/\/$/, '');
  return trimmed || DEFAULT_SITE_URL;
}

function normalizePath(path: string): string {
  const p = path.trim() || '/';
  if (p === '/') return '/websites';
  return p.startsWith('/') ? p : `/${p}`;
}

function buildUrl(siteUrl: string, path: string): string {
  return `${normalizeSiteUrl(siteUrl)}${normalizePath(path)}`;
}

function catalogLine(
  productLines: AgencyProductLine[],
  id: AgencyProductLineId,
): AgencyProductLine {
  return (
    productLines.find((line) => line.id === id) ??
    DEFAULT_PRODUCT_LINES.find((line) => line.id === id) ?? {
      id,
      label: id.replace(/_/g, ' '),
      path: `/${id.replace(/_/g, '-')}`,
    }
  );
}

/** Normalize scoring/BOI gap key aliases into router canonical ids. */
export function normalizeGapId(raw: string): string {
  const id = raw.trim().replace(/^gap:/, '');
  switch (id) {
    case 'no_site':
      return 'no_website';
    case 'not_mobile':
      return 'not_mobile_friendly';
    case 'crawl_unreachable':
      return 'website_unreachable';
    default:
      return id;
  }
}

function collectGaps(input: ResolveSelectedOfferInput): Set<string> {
  const gaps = new Set<string>();
  for (const raw of input.gapIds ?? []) {
    if (raw?.trim()) gaps.add(normalizeGapId(raw));
  }
  if (input.presenceClass === 'social_only') gaps.add('social_only');
  if (input.presenceClass === 'link_in_bio') gaps.add('link_in_bio_only');
  if (input.presenceClass === 'greenfield' || input.presenceClass === 'social_only' || input.presenceClass === 'link_in_bio') {
    gaps.add('no_website');
  }
  return gaps;
}

function collectPains(input: ResolveSelectedOfferInput): Set<string> {
  return new Set((input.painIds ?? []).map((id) => id.trim()).filter(Boolean));
}

function industryBlob(input: ResolveSelectedOfferInput): string {
  return [input.industry, input.businessName, ...(input.intentTexts ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function detectHints(blob: string): Set<IndustryHint> {
  const hints = new Set<IndustryHint>();
  for (const [hint, keywords] of Object.entries(HINT_KEYWORDS) as Array<[IndustryHint, string[]]>) {
    if (keywords.some((kw) => blob.includes(kw))) hints.add(hint);
  }
  return hints;
}

function normalizeOpportunityType(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim().toLowerCase();
  if (value.includes('demand')) return 'demand_response';
  if (value.includes('greenfield')) return 'greenfield';
  if (value.includes('redesign')) return 'redesign';
  if (value.includes('modernize')) return 'modernize';
  if (value === 'general' || value.includes('general')) return 'general';
  return value.replace(/\s+/g, '_');
}

function isGreenfieldPresence(presenceClass: ResolveSelectedOfferInput['presenceClass']): boolean {
  return (
    presenceClass === 'greenfield' ||
    presenceClass === 'social_only' ||
    presenceClass === 'link_in_bio'
  );
}

function hasGap(gaps: Set<string>, ...ids: string[]): boolean {
  return ids.some((id) => gaps.has(id));
}

function hasPain(pains: Set<string>, ...ids: string[]): boolean {
  return ids.some((id) => pains.has(id));
}

function matchedFrom(
  gaps: Set<string>,
  pains: Set<string>,
  gapCandidates: string[],
  painCandidates: string[],
): { matchedGapIds: string[]; matchedPainIds: string[] } {
  return {
    matchedGapIds: gapCandidates.filter((id) => gaps.has(id)),
    matchedPainIds: painCandidates.filter((id) => pains.has(id)),
  };
}

function offer(args: {
  productLine: SelectedOfferProductLine;
  catalogId: AgencyProductLineId;
  productLines: AgencyProductLine[];
  siteUrl: string;
  packageId: string | null;
  why: string;
  ask: string;
  matchedGapIds: string[];
  matchedPainIds: string[];
  labelOverride?: string;
}): SelectedOffer {
  const line = catalogLine(args.productLines, args.catalogId);
  return {
    productLine: args.productLine,
    label: args.labelOverride ?? line.label,
    url: buildUrl(args.siteUrl, line.path),
    packageId: args.packageId,
    why: args.why,
    matchedGapIds: args.matchedGapIds,
    matchedPainIds: args.matchedPainIds,
    ask: args.ask,
  };
}

/**
 * Deterministic Case File / BOI → one SleeklyBuilt product + deep link.
 * See discovery/docs/OFFER_ROUTER.md.
 */
export function resolveSelectedOffer(input: ResolveSelectedOfferInput): SelectedOffer | null {
  if (input.status === 'blocked') return null;

  const siteUrl = normalizeSiteUrl(input.siteUrl);
  const productLines = input.productLines?.length ? input.productLines : DEFAULT_PRODUCT_LINES;
  const gaps = collectGaps(input);
  const pains = collectPains(input);
  const hints = detectHints(industryBlob(input));
  const opportunityType =
    normalizeOpportunityType(input.opportunityType) ??
    (isGreenfieldPresence(input.presenceClass) ? 'greenfield' : null);
  const greenfield =
    isGreenfieldPresence(input.presenceClass) ||
    hasGap(gaps, 'no_website', 'social_only', 'link_in_bio_only') ||
    hasPain(pains, 'pain:no_web_presence', 'pain:review:no_website');
  const hasRealSite = input.presenceClass === 'redesign' && !greenfield;
  const intentBlob = (input.intentTexts ?? []).join(' ');
  const appRequested = APP_INTENT_RE.test(intentBlob) || hints.has('app_likely');
  const opsRequested = OPS_INTENT_RE.test(intentBlob) || hints.has('ops_heavy');

  const base = { productLines, siteUrl };

  // Step 0 — unreachable-only caution
  if (
    hasGap(gaps, 'website_unreachable') &&
    !hasGap(gaps, 'no_website', 'social_only', 'link_in_bio_only') &&
    !hasPain(pains, 'pain:no_web_presence')
  ) {
    const matched = matchedFrom(gaps, pains, ['website_unreachable'], []);
    return offer({
      ...base,
      productLine: 'websites',
      catalogId: 'websites',
      packageId: 'smart',
      why: 'Listed URL unreachable — verify before claiming no site',
      ask: 'Mind if we confirm the live URL, then suggest the right fix?',
      ...matched,
    });
  }

  // Step 1 — demand + presence / industry
  if (opportunityType === 'demand_response') {
    if (opsRequested && !greenfield) {
      const matched = matchedFrom(gaps, pains, [...gaps], [...pains]);
      return offer({
        ...base,
        productLine: 'business_systems',
        catalogId: 'business_systems',
        packageId: null,
        why: 'Hot demand + ops-heavy industry — business system path',
        ask: 'Open to a short call on the system that would replace the spreadsheet stack?',
        ...matched,
      });
    }
    if (appRequested) {
      const matched = matchedFrom(gaps, pains, [...gaps], [...pains]);
      if (greenfield) {
        return offer({
          ...base,
          productLine: 'app_plus_site',
          catalogId: 'mobile_apps',
          packageId: null,
          labelOverride: 'App + website',
          why: 'Demand asks for an app and there is no owned site yet',
          ask: 'Want a quick sketch of app + web presence for that use case?',
          ...matched,
        });
      }
      return offer({
        ...base,
        productLine: 'mobile_apps',
        catalogId: 'mobile_apps',
        packageId: null,
        why: 'Demand language points at a mobile app',
        ask: 'Worth a short chat about the Android/iOS workflow you need?',
        ...matched,
      });
    }
    if (greenfield) {
      const socialOrBio = hasGap(gaps, 'social_only', 'link_in_bio_only');
      const preferSleek = socialOrBio || hints.has('simple_local') || !hints.has('multi_page');
      if (preferSleek && !hints.has('multi_page') && !hints.has('commerce')) {
        const matched = matchedFrom(
          gaps,
          pains,
          ['no_website', 'social_only', 'link_in_bio_only'],
          ['pain:no_web_presence', 'pain:review:no_website', 'pain:review:online_presence'],
        );
        return offer({
          ...base,
          productLine: 'sleek_pages',
          catalogId: 'sleek_pages',
          packageId: 'basic',
          why: 'Hot intent + no owned site — fast Sleek Page launch',
          ask: 'Quick WhatsApp yes if a one-day launch page would help?',
          ...matched,
        });
      }
      const matched = matchedFrom(
        gaps,
        pains,
        ['no_website', 'social_only', 'link_in_bio_only'],
        ['pain:no_web_presence', 'pain:review:no_website'],
      );
      return offer({
        ...base,
        productLine: 'websites',
        catalogId: 'websites',
        packageId: 'smart',
        why: 'Hot intent + no owned site — full website fit',
        ask: 'Open to a short note on the right website scope while intent is hot?',
        ...matched,
      });
    }
    if (
      hasRealSite &&
      (hasGap(gaps, 'not_mobile_friendly') ||
        hasPain(pains, 'pain:website_quality', 'pain:review:outdated'))
    ) {
      const matched = matchedFrom(
        gaps,
        pains,
        ['not_mobile_friendly'],
        ['pain:website_quality', 'pain:review:outdated'],
      );
      return offer({
        ...base,
        productLine: 'websites',
        catalogId: 'websites',
        packageId: 'smart',
        why: 'Demand plus broken/outdated site — redesign path',
        ask: 'Want a focused before/after plan for the live site?',
        ...matched,
      });
    }
  }

  // Step 2 — greenfield
  if (greenfield) {
    if (hasGap(gaps, 'social_only', 'link_in_bio_only')) {
      const matched = matchedFrom(
        gaps,
        pains,
        ['social_only', 'link_in_bio_only', 'no_website'],
        ['pain:no_web_presence', 'pain:review:online_presence'],
      );
      return offer({
        ...base,
        productLine: 'sleek_pages',
        catalogId: 'sleek_pages',
        packageId: 'basic',
        why: 'Social or link-in-bio only — first owned Sleek Page',
        ask: 'Quick WhatsApp yes if a one-day launch page would help?',
        ...matched,
      });
    }
    if (hints.has('multi_page') || hints.has('commerce')) {
      const matched = matchedFrom(
        gaps,
        pains,
        ['no_website'],
        ['pain:no_web_presence', 'pain:review:no_website', 'pain:commerce_gap'],
      );
      return offer({
        ...base,
        productLine: 'websites',
        catalogId: 'websites',
        packageId: 'smart',
        why: 'No site and category needs multi-page or shop structure',
        ask: 'Worth a short look at the right website package for your category?',
        ...matched,
      });
    }

    const matched = matchedFrom(
      gaps,
      pains,
      ['no_website'],
      ['pain:no_web_presence', 'pain:review:no_website'],
    );
    return offer({
      ...base,
      productLine: 'sleek_pages',
      catalogId: 'sleek_pages',
      packageId: 'basic',
      why: 'Greenfield — first professional presence via Sleek Page',
      ask: 'Quick WhatsApp yes if a one-day launch page would help?',
      ...matched,
    });
  }

  // Step 3 — has website
  if (hasRealSite || opportunityType === 'redesign' || opportunityType === 'modernize') {
    if (hints.has('ops_heavy') || opsRequested) {
      const matched = matchedFrom(gaps, pains, [...gaps], [...pains]);
      return offer({
        ...base,
        productLine: 'business_systems',
        catalogId: 'business_systems',
        packageId: null,
        why: 'Existing presence + ops-heavy industry — business system',
        ask: 'Open to mapping the workflow a system should own?',
        ...matched,
      });
    }
    if (
      hasGap(gaps, 'not_mobile_friendly') ||
      hasPain(pains, 'pain:review:outdated', 'pain:website_quality') ||
      opportunityType === 'redesign'
    ) {
      const matched = matchedFrom(
        gaps,
        pains,
        ['not_mobile_friendly'],
        ['pain:review:outdated', 'pain:website_quality'],
      );
      return offer({
        ...base,
        productLine: 'websites',
        catalogId: 'websites',
        packageId: 'smart',
        why: 'Site mobile/quality gaps — website redesign',
        ask: 'Want a fixed-scope refresh plan for the current site?',
        ...matched,
      });
    }
    if (hasGap(gaps, 'missing_ecommerce') || hasPain(pains, 'pain:commerce_gap')) {
      const matched = matchedFrom(gaps, pains, ['missing_ecommerce'], ['pain:commerce_gap']);
      return offer({
        ...base,
        productLine: 'websites',
        catalogId: 'websites',
        packageId: 'premium',
        why: 'Commerce gap on existing site — shop-capable website',
        ask: 'Interested in adding a clean online sales path to the site?',
        ...matched,
      });
    }
    if (
      hasGap(gaps, 'missing_online_booking') ||
      hasPain(pains, 'pain:booking_gap', 'pain:review:hard_to_book')
    ) {
      const preferSystems = hints.has('ops_heavy') || hints.has('simple_local') === false;
      // Clinics/salons: booking as operational core → business systems; else websites module language
      const useSystems =
        hints.has('ops_heavy') ||
        /\b(clinic|hospital|hotel|salon|spa|dentist)\b/i.test(industryBlob(input));
      const matched = matchedFrom(
        gaps,
        pains,
        ['missing_online_booking'],
        ['pain:booking_gap', 'pain:review:hard_to_book'],
      );
      if (useSystems || preferSystems) {
        return offer({
          ...base,
          productLine: 'website_modules',
          catalogId: 'business_systems',
          packageId: null,
          labelOverride: 'Online booking',
          why: 'Booking friction — operational booking path',
          ask: 'Would self-serve booking on the site cut phone tag for you?',
          ...matched,
        });
      }
      return offer({
        ...base,
        productLine: 'website_modules',
        catalogId: 'websites',
        packageId: 'smart',
        labelOverride: 'Booking on your site',
        why: 'Missing online booking — website module path',
        ask: 'Want booking built into the site so customers stop chasing calls?',
        ...matched,
      });
    }
    if (hasGap(gaps, 'missing_email_capture') || hasPain(pains, 'pain:lead_capture_gap')) {
      const matched = matchedFrom(gaps, pains, ['missing_email_capture'], ['pain:lead_capture_gap']);
      return offer({
        ...base,
        productLine: 'website_modules',
        catalogId: 'websites',
        packageId: 'smart',
        labelOverride: 'Lead capture forms',
        why: 'Lead-capture gap on existing site',
        ask: 'Open to adding a form path so enquiries stop dying in DMs?',
        ...matched,
      });
    }
    if (hasGap(gaps, 'no_https') || opportunityType === 'modernize') {
      const matched = matchedFrom(gaps, pains, ['no_https'], ['pain:website_quality']);
      return offer({
        ...base,
        productLine: 'websites',
        catalogId: 'websites',
        packageId: 'smart',
        why: 'Trust/HTTPS modernize on existing site',
        ask: 'Worth a low-friction upgrade pass on the live site?',
        ...matched,
      });
    }
  }

  // Step 4 — app/systems without earlier lock (rare)
  if (appRequested) {
    const matched = matchedFrom(gaps, pains, [...gaps], [...pains]);
    if (greenfield) {
      return offer({
        ...base,
        productLine: 'app_plus_site',
        catalogId: 'mobile_apps',
        packageId: null,
        labelOverride: 'App + website',
        why: 'App request with no owned site',
        ask: 'Want a short outline of app + web for that workflow?',
        ...matched,
      });
    }
    return offer({
      ...base,
      productLine: 'mobile_apps',
      catalogId: 'mobile_apps',
      packageId: null,
      why: 'Explicit app request',
      ask: 'Worth a short chat about the mobile product you need?',
      ...matched,
    });
  }
  if (opsRequested) {
    const matched = matchedFrom(gaps, pains, [...gaps], [...pains]);
    return offer({
      ...base,
      productLine: 'business_systems',
      catalogId: 'business_systems',
      packageId: null,
      why: 'Ops/platform language — business system',
      ask: 'Open to scoping the system that should run the operation?',
      ...matched,
    });
  }

  // Step 5 — fallback (never homepage)
  const hasContact = Boolean(input.hasPhone || input.hasEmail);
  if (hasContact || gaps.size > 0 || pains.size > 0) {
    return offer({
      ...base,
      productLine: 'websites',
      catalogId: 'websites',
      packageId: 'smart',
      why: 'Validate fit on first touch — website as default non-homepage path',
      ask: 'Mind if we confirm what you need online before proposing scope?',
      matchedGapIds: [...gaps].slice(0, 5),
      matchedPainIds: [...pains].slice(0, 5),
    });
  }

  return null;
}
