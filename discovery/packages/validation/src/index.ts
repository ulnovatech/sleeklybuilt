import { LEAD_STATUSES, type LeadStatus } from '@agency/types';
import { z } from 'zod';

const BLOCKED_DISCOVERY_COUNTRIES = new Set([
  '__integration_test__',
  'Testland',
  'Failland',
  'Acceptance',
]);

/** Shared operator-console list query. Offset paging is intentional for scoped CRM lists; keyset can replace per-surface later. */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).optional(),
  sort: z.string().trim().min(1).max(50).optional(),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export function paginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return { items, total, page, limit };
}

/** Parse URLSearchParams into a Zod object schema, dropping empty values. */
export function parseListSearchParams<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams | Record<string, string | undefined | null>,
): z.SafeParseReturnType<z.input<T>, z.output<T>> {
  const raw: Record<string, string> = {};
  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      if (value.trim()) raw[key] = value;
    });
  } else {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value != null && String(value).trim()) raw[key] = String(value);
    });
  }
  return schema.safeParse(raw);
}

export const crmLeadSortSchema = z.enum([
  'updatedAt',
  'createdAt',
  'status',
  'priority',
  'nextFollowUpAt',
  'name',
]);

export const crmLeadsListQuerySchema = listQuerySchema.extend({
  status: z.enum(LEAD_STATUSES as [LeadStatus, ...LeadStatus[]]).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  followUpDue: z.enum(['overdue', 'upcoming', 'any']).optional(),
  sort: crmLeadSortSchema.default('updatedAt'),
});

export type CrmLeadsListQuery = z.infer<typeof crmLeadsListQuerySchema>;

/** Stages that carry an actionable follow-up date; closed and archived pursuits are excluded. */
export const FOLLOW_UP_STAGES = [
  'CONTACTED',
  'REPLIED',
  'QUALIFIED',
  'PROPOSAL_SENT',
] as const satisfies readonly LeadStatus[];

/** Due follow-ups list: open stage + nextFollowUpAt <= now. Offset paging matches CRM leads. */
export const crmFollowUpsListQuerySchema = listQuerySchema.extend({
  status: z.enum(FOLLOW_UP_STAGES).optional(),
  sort: z.enum(['nextFollowUpAt', 'updatedAt', 'name']).default('nextFollowUpAt'),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

export type CrmFollowUpsListQuery = z.infer<typeof crmFollowUpsListQuerySchema>;

export const outreachQueueListQuerySchema = listQuerySchema.extend({
  status: z.enum(LEAD_STATUSES as [LeadStatus, ...LeadStatus[]]).optional(),
  channel: z.enum(['email', 'whatsapp', 'phone', 'any']).default('any'),
  followUpDue: z.enum(['overdue', 'upcoming', 'any']).default('any'),
  sort: z.enum(['follow_up', 'priority', 'score', 'updatedAt', 'name']).default('follow_up'),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

export type OutreachQueueListQuery = z.infer<typeof outreachQueueListQuerySchema>;

export const outreachDraftExportQuerySchema = z.object({
  channel: z.enum(['email', 'whatsapp', 'phone', 'follow_up']).default('email'),
  date: z.enum(['today', 'all']).optional(),
  includeUnreviewed: z.coerce.boolean().optional().default(false),
});

export type OutreachDraftExportQuery = z.infer<typeof outreachDraftExportQuerySchema>;

export const reviewQueueListQuerySchema = listQuerySchema.extend({
  runId: z.string().uuid().optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  reachability: z.enum(['high', 'medium', 'low', 'none']).optional(),
  verification: z.enum(['verified', 'unverified', 'all']).optional(),
  sort: z.enum(['score']).default('score'),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

export type ReviewQueueListQuery = z.infer<typeof reviewQueueListQuerySchema>;

export const createDiscoveryRunSchema = z
  .object({
    country: z.string().min(1).max(100),
    city: z.string().min(1).max(100),
    industry: z.string().min(1).max(200),
    profile: z.enum(['micro', 'standard', 'boost']).optional(),
    prospectFocus: z.boolean().optional(),
    boiNarrative: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (BLOCKED_DISCOVERY_COUNTRIES.has(data.country)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Test fixture countries cannot be used for discovery runs.',
        path: ['country'],
      });
    }
  });

export const DISCOVERY_PLAN_SOURCES = [
  'google_maps',
  'public_search',
  'facebook',
  'social_search',
  'csv_import',
] as const;

export const discoveryPlanCadenceSchema = z.object({
  everyHours: z.number().int().min(1).max(168 * 4).default(24),
  activeHours: z
    .object({
      start: z.number().int().min(0).max(23),
      end: z.number().int().min(0).max(23),
      timezone: z.string().min(1).max(80).default('UTC'),
    })
    .optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).max(7).optional(),
});

export const discoveryPlanTargetsSchema = z.object({
  countries: z.array(z.string().min(1).max(100)).min(1).max(50),
  citiesByCountry: z.record(z.string(), z.array(z.string().min(1).max(100)).max(100)).default({}),
  industries: z.array(z.string().min(1).max(200)).min(1).max(100),
  keywords: z.array(z.string().min(1).max(100)).max(50).optional(),
});

export const discoveryPlanFiltersSchema = z.object({
  presence: z.enum(['greenfield', 'redesign', 'any']).default('greenfield'),
  minScore: z.number().int().min(0).max(100).optional(),
  minRating: z.number().min(0).max(5).optional(),
  minReviews: z.number().int().min(0).optional(),
  requirePhone: z.boolean().optional(),
  requireEmail: z.boolean().optional(),
});

export const discoveryPlanLimitsSchema = z.object({
  maxRunsPerDay: z.number().int().min(1).max(100).default(8),
  maxNewAccountsPerDay: z.number().int().min(1).max(5000).optional(),
  maxConcurrentRuns: z.number().int().min(1).max(10).default(1),
});

const discoveryPlanFieldsSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  planType: z.enum(['discovery', 'monitor']).default('discovery'),
  status: z.enum(['active', 'paused', 'archived']).default('active'),
  sources: z.array(z.enum(DISCOVERY_PLAN_SOURCES)).min(1).max(10).default(['google_maps', 'public_search']),
  targets: discoveryPlanTargetsSchema,
  filters: discoveryPlanFiltersSchema.optional(),
  runProfile: z.enum(['micro', 'standard', 'boost']).default('standard'),
  prospectFocus: z.boolean().default(false),
  boiNarrative: z.boolean().default(false),
  campaignKey: z.string().trim().max(80).optional(),
  templateKey: z.string().trim().max(80).optional(),
  cadence: discoveryPlanCadenceSchema.default({ everyHours: 24 }),
  limits: discoveryPlanLimitsSchema.optional(),
  priority: z.number().int().min(-100).max(100).default(0),
  /** When true (default), schedule first tick ASAP. */
  scheduleImmediately: z.boolean().default(true),
});

export const createDiscoveryPlanSchema = discoveryPlanFieldsSchema.superRefine((data, ctx) => {
  for (const country of data.targets.countries) {
    if (BLOCKED_DISCOVERY_COUNTRIES.has(country)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Test fixture country not allowed: ${country}`,
        path: ['targets', 'countries'],
      });
    }
  }
});

export const updateDiscoveryPlanSchema = discoveryPlanFieldsSchema
  .omit({ scheduleImmediately: true })
  .partial()
  .extend({
    pausedReason: z.string().trim().max(500).nullable().optional(),
    status: z.enum(['active', 'paused', 'archived']).optional(),
  });

export const discoveryPlansListQuerySchema = listQuerySchema.extend({
  status: z.enum(['active', 'paused', 'archived']).optional(),
  planType: z.enum(['discovery', 'monitor']).optional(),
  sort: z.enum(['updatedAt', 'nextRunAt', 'name', 'priority', 'createdAt']).default('updatedAt'),
});

export type CreateDiscoveryPlanInput = z.infer<typeof createDiscoveryPlanSchema>;
export type UpdateDiscoveryPlanInput = z.infer<typeof updateDiscoveryPlanSchema>;
export type DiscoveryPlansListQuery = z.infer<typeof discoveryPlansListQuerySchema>;

export const createIntentSignalSchema = z.object({
  businessId: z.string().uuid(),
  source: z.string().min(1).max(100),
  signalType: z.enum([
    'job_post',
    'hiring',
    'help_request',
    'pain_signal',
    'public_request',
    'other',
  ]),
  signalClass: z.enum(['enrichment', 'demand']).optional(),
  signalStrength: z.number().min(0).max(100),
});

export const pasteDemandIntentSchema = z.object({
  sourceUrl: z.string().url().max(1000),
  title: z.string().min(1).max(500),
  snippet: z.string().max(5000).optional(),
  signalType: z.enum([
    'job_post',
    'hiring',
    'help_request',
    'pain_signal',
    'public_request',
    'other',
  ]),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  businessId: z.string().uuid().optional(),
  signalStrength: z.number().min(0).max(100).optional(),
});

export const createLeadSchema = z.object({
  businessId: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  owner: z.string().min(1).max(100).default('operator'),
  promoteOnly: z.boolean().optional(),
  status: z.enum(['NEW', 'REVIEWED']).optional(),
});

export const transitionLeadSchema = z.object({
  leadId: z.string().uuid(),
  toStatus: z.enum([
    'NEW',
    'REVIEWED',
    'CONTACTED',
    'REPLIED',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'CLOSED_WON',
    'CLOSED_LOST',
    'NO_RESPONSE',
    'NOT_INTERESTED',
    'ARCHIVED',
  ]),
  note: z.string().optional(),
});

export const createNoteSchema = z.object({
  leadId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export const markRepliedSchema = z.object({
  note: z.string().max(5000).optional(),
  channel: z.enum(['email', 'linkedin', 'phone', 'other']).optional(),
});

export const createOutreachTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().max(500).optional(),
  body: z.string().min(1).max(10000),
  channel: z.enum(['email', 'linkedin', 'phone', 'other']).default('email'),
  opportunityType: z
    .enum(['demand_response', 'greenfield', 'redesign', 'modernize', 'general'])
    .optional()
    .nullable(),
});

export const createOutreachMessageSchema = z.object({
  leadId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  subject: z.string().max(500).optional(),
  body: z.string().min(1).max(10000),
  channel: z.enum(['email', 'linkedin', 'phone', 'other']).default('email'),
  markContacted: z.boolean().optional().default(true),
});

export const createProposalSchema = z.object({
  leadId: z.string().uuid(),
  title: z.string().min(1).max(500),
  amount: z.number().min(0),
  body: z.string().optional(),
  autoQualify: z.boolean().optional().default(false),
  packageId: z.string().trim().min(1).max(80).optional(),
});

export const createRevenueRecordSchema = z.object({
  leadId: z.string().uuid(),
  clientName: z.string().min(1).max(300),
  amount: z.number().min(0),
  type: z.enum(['one_time', 'retainer']),
  proposalId: z.string().uuid().optional(),
});
