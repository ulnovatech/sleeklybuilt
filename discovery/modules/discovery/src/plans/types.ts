export type PlanStatus = 'active' | 'paused' | 'archived';
export type PlanType = 'discovery' | 'monitor';
export type PlanEventType =
  | 'scheduled'
  | 'skipped_hours'
  | 'skipped_cap'
  | 'skipped_budget'
  | 'skipped_no_target'
  | 'skipped_suppressed'
  | 'target_suppressed'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'resumed'
  | 'run_now';

export type PlanCadence = {
  everyHours: number;
  activeHours?: {
    start: number;
    end: number;
    timezone: string;
  };
  daysOfWeek?: number[];
};

export type PlanTargetsConfig = {
  countries: string[];
  citiesByCountry: Record<string, string[]>;
  industries: string[];
  keywords?: string[];
};

export type PlanFiltersConfig = {
  presence?: 'greenfield' | 'redesign' | 'any';
  minScore?: number;
  minRating?: number;
  minReviews?: number;
  requirePhone?: boolean;
  requireEmail?: boolean;
};

export type PlanLimitsConfig = {
  maxRunsPerDay: number;
  maxNewAccountsPerDay?: number;
  maxConcurrentRuns: number;
};

export type PlanSegment = {
  country: string;
  city: string;
  industry: string;
};
