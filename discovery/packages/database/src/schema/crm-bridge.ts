import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { accounts } from './accounts';
import { leads } from './crm';

/** Closed-won/lost outcomes pulled from sleekly-dash companies. */
export const leadOutcomes = pgTable('lead_outcomes', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  sleeklyDashCompanyId: integer('sleekly_dash_company_id').notNull().unique(),
  discoveryAccountId: varchar('discovery_account_id', { length: 64 }),
  outcomeStatus: varchar('outcome_status', { length: 20 }).notNull(),
  projectValueUgx: integer('project_value_ugx'),
  servicesSold: jsonb('services_sold').$type<string[] | unknown>(),
  lossReason: text('loss_reason'),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  segmentKey: varchar('segment_key', { length: 240 }),
  raw: jsonb('raw').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Idempotent bridge sync audit (push + pull). */
export const crmBridgeSync = pgTable('crm_bridge_sync', {
  id: uuid('id').primaryKey().defaultRandom(),
  direction: varchar('direction', { length: 40 }).notNull(),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  externalKey: varchar('external_key', { length: 120 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>(),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
