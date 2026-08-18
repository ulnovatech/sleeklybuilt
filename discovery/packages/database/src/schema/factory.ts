import { date, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';
import { businesses } from './discovery';
import { leads } from './crm';

export const factoryCohorts = pgTable(
  'factory_cohorts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    harvestDate: date('harvest_date', { mode: 'string' }).notNull(),
    sellDate: date('sell_date', { mode: 'string' }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('purifying'),
    keeperCount: integer('keeper_count').notNull().default(0),
    dumpsterCount: integer('dumpster_count').notNull().default(0),
    errorMessage: text('error_message'),
    fallbackCohortId: uuid('fallback_cohort_id'),
    frozenAt: timestamp('frozen_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sellDateUidx: uniqueIndex('factory_cohorts_sell_date_uidx').on(table.sellDate),
  }),
);

export const factoryCohortMembers = pgTable(
  'factory_cohort_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cohortId: uuid('cohort_id')
      .notNull()
      .references(() => factoryCohorts.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
    role: varchar('role', { length: 20 }).notNull(),
    missReason: varchar('miss_reason', { length: 40 }),
    rank: integer('rank'),
    rankScore: integer('rank_score'),
    recommendedChannel: varchar('recommended_channel', { length: 20 }),
    caseFile: jsonb('case_file').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    cohortAccountUidx: uniqueIndex('factory_cohort_members_cohort_account_uidx').on(
      table.cohortId,
      table.accountId,
    ),
  }),
);
