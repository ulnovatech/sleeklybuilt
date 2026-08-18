/**
 * v1 product language — Path A web agency charter.
 * @see docs/V1_CHARTER.md
 */

export const PRODUCT = {
  name: 'Lead Discovery OS',
  edition: 'Operations intelligence',
  tagline: 'Discover · qualify · pursue · close',
} as const;

export type NavItem = { href: string; label: string };

export type NavSection = { label: string; items: NavItem[] };

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Discover',
    items: [
      { href: '/discovery', label: 'Discovery runs' },
      { href: '/discovery/plans', label: 'Discovery plans' },
      { href: '/intent', label: 'Demand' },
    ],
  },
  {
    label: 'Decide',
    items: [{ href: '/review', label: 'Queue' }],
  },
  {
    label: 'Qualification',
    items: [{ href: '/data-quality', label: 'Data quality' }],
  },
  {
    label: 'Pursue',
    items: [
      { href: '/leads', label: 'Pipeline' },
      { href: '/follow-ups', label: 'Follow-ups' },
      { href: '/outreach', label: 'Outreach Queue' },
    ],
  },
  {
    label: 'Close',
    items: [
      { href: '/proposals', label: 'Proposals' },
      { href: '/revenue', label: 'Revenue' },
    ],
  },
  {
    label: 'Automation',
    items: [
      { href: '/automation', label: 'Automation Center' },
      { href: '/hunter', label: 'Market Hunter' },
    ],
  },
  {
    label: 'Analytics',
    items: [{ href: '/ops', label: 'Today' }],
  },
  {
    label: 'Settings',
    items: [
      { href: '/settings', label: 'Settings' },
    ],
  },
];

export const PAGE_COPY = {
  ops: {
    title: 'Today',
    description: 'Overnight activity, triage priorities, and acquisition KPIs.',
  },
  discovery: {
    title: 'Discovery runs',
    description: 'Proactive prospecting by geo and industry — save runs as recurring plans.',
  },
  discoveryPlans: {
    title: 'Discovery plans',
    description: 'Recurring discovery schedules with guided setup and overnight yield.',
  },
  demandInbox: {
    title: 'Demand',
    description: 'Capture and triage orphan demand — matched signals flow to Queue.',
  },
  addDemand: {
    title: 'Capture demand',
    description: 'Paste real demand signals; unmatched entries land in Demand.',
  },
  workQueue: {
    title: 'Queue',
    description: 'Daily triage — greenfield first, inspect evidence, promote or dismiss inline.',
  },
  opportunities: {
    title: 'Opportunities',
    description: 'Pre-pursuit accounts from discovery and demand — promote when ready.',
  },
  pursuits: {
    title: 'Pipeline',
    description: 'Active sales motions — outreach, follow-up, and proposals per account.',
  },
  outreach: {
    title: 'Outreach Queue',
    description: 'Qualified pursuits needing contact — Case File, channels, and AI pitches in one workspace.',
  },
  followUps: {
    title: 'Follow-ups',
    description: 'Open pursuits with follow-up due — record replies or clear stale outreach.',
  },
  proposals: {
    title: 'Proposals',
    description: 'Draft and send proposals for qualified pursuits.',
  },
  revenue: {
    title: 'Revenue',
    description: 'Close won deals and track revenue proof.',
  },
  settings: {
    title: 'Platform settings',
    description: 'Acquisition budgets, channel pitch provider, ICP scoring, credentials, and integrations.',
  },
} as const;

/** Business Opportunity Intelligence — operator-facing BOI labels */
export const BOI_COPY = {
  productName: 'Business Opportunity Intelligence',
  shortName: 'BOI',
  opportunityBrief: 'Opportunity Brief',
  viewBrief: 'View opportunity brief',
  hideBrief: 'Hide opportunity brief',
  loading: 'Loading opportunity brief…',
  retry: 'Retry',
  purchaseReadiness: 'Purchase readiness',
  topPains: 'Evidence-backed pains',
  digitalGaps: 'Digital gaps',
  recommendedServices: 'Recommended services',
  pitchAngle: 'Pitch angle',
  executiveSummary: 'Executive summary',
  narrativeSource: {
    rules: 'Rules-based',
    llm: 'AI-enhanced',
  } as const,
  customerSentiment: 'Customer sentiment',
  praiseThemes: 'What customers praise',
  complaintThemes: 'Complaint themes',
  techStack: 'Technology detected',
  projectValue: 'Indicative project value',
  projectValueDisclaimer: 'Rules-based estimate — not a quote. Validate scope on discovery call.',
  pageSpeed: 'Mobile performance',
  pageSpeedScore: 'PageSpeed score',
  evidence: 'Supporting evidence',
  emptyRunning:
    'Pipeline still running — the opportunity brief is generated after profile enrichment and Places review.',
  emptyCompleted:
    'No opportunity brief yet. This business may need more enrichment data (reviews, crawl, or contact paths).',
  partialNote: 'Partial intelligence — more data may arrive as the pipeline completes.',
  errorLoad: 'Could not load opportunity brief.',
  websiteBrief: {
    viewBrief: 'View website brief',
    hideBrief: 'Hide website brief',
    errorLoad: 'Could not load website brief.',
  },
  readinessBands: {
    high: 'High readiness',
    medium: 'Medium readiness',
    low: 'Low readiness',
    unknown: 'Readiness unknown',
  } as const,
  status: {
    ready: 'Ready',
    partial: 'Partial',
    pending: 'Pending',
  } as const,
} as const;

export const V1_CHARTER_SUMMARY = {
  icp: 'Web and digital agencies hunting local SMB website work.',
  workflow: 'Find (discovery + demand) → Triage (work queue) → Pursue → Close (revenue).',
  nonGoals: [
    'Tender / procurement platform',
    'Public multi-tenant SaaS on v1',
    'Automated mass email',
    'Generic any-industry lead gen',
  ],
} as const;
