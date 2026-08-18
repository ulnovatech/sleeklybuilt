import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { discoveryRuns } from './discovery';

/** Recurring discovery (or monitor) plan — scheduler source of truth. */
export const discoveryPlans = pgTable('discovery_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  planType: varchar('plan_type', { length: 20 }).notNull().default('discovery'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  sources: jsonb('sources').$type<string[]>().notNull().default([]),
  targets: jsonb('targets').$type<Record<string, unknown>>().notNull().default({}),
  filters: jsonb('filters').$type<Record<string, unknown>>().notNull().default({}),
  runProfile: varchar('run_profile', { length: 20 }).notNull().default('standard'),
  prospectFocus: boolean('prospect_focus').notNull().default(false),
  boiNarrative: boolean('boi_narrative').notNull().default(false),
  campaignKey: varchar('campaign_key', { length: 80 }),
  templateKey: varchar('template_key', { length: 80 }),
  cadence: jsonb('cadence').$type<Record<string, unknown>>().notNull().default({}),
  limits: jsonb('limits').$type<Record<string, unknown>>().notNull().default({}),
  priority: integer('priority').notNull().default(0),
  nextRunAt: timestamp('next_run_at', { withTimezone: true }),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  pausedReason: text('paused_reason'),
  consecutiveFailures: integer('consecutive_failures').notNull().default(0),
  createdBy: varchar('created_by', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Country × city × industry rotation unit for a plan. */
export const discoveryPlanTargets = pgTable(
  'discovery_plan_targets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => discoveryPlans.id, { onDelete: 'cascade' }),
    country: varchar('country', { length: 100 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    industry: varchar('industry', { length: 200 }).notNull(),
    lastRunAt: timestamp('last_run_at', { withTimezone: true }),
    lastRunId: uuid('last_run_id').references(() => discoveryRuns.id, { onDelete: 'set null' }),
    runCount: integer('run_count').notNull().default(0),
    lastYield: jsonb('last_yield').$type<Record<string, unknown>>(),
    yieldScore: real('yield_score').notNull().default(0),
    wonCount: integer('won_count').notNull().default(0),
    lostCount: integer('lost_count').notNull().default(0),
    suppressedUntil: timestamp('suppressed_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    planSegmentUidx: uniqueIndex('discovery_plan_targets_plan_segment_uidx').on(
      table.planId,
      table.country,
      table.city,
      table.industry,
    ),
  }),
);

/** Observable scheduler decisions (scheduled, skipped_*, completed, failed). */
export const discoveryPlanEvents = pgTable('discovery_plan_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id')
    .notNull()
    .references(() => discoveryPlans.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 40 }).notNull(),
  message: text('message'),
  runId: uuid('run_id').references(() => discoveryRuns.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
