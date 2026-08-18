import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { leads } from './crm';

export type OutreachDraftChannel = 'email' | 'whatsapp' | 'phone' | 'follow_up';

export const outreachDrafts = pgTable(
  'outreach_drafts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    channel: varchar('channel', { length: 30 }).notNull(),
    subject: varchar('subject', { length: 500 }),
    body: text('body').notNull(),
    factPackHash: varchar('fact_pack_hash', { length: 64 }).notNull(),
    factPack: jsonb('fact_pack').$type<Record<string, unknown>>().notNull(),
    provider: varchar('provider', { length: 40 }).notNull(),
    model: varchar('model', { length: 120 }).notNull(),
    regenerated: boolean('regenerated').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    leadChannelIdx: uniqueIndex('outreach_drafts_lead_channel_uidx').on(table.leadId, table.channel),
  }),
);

export const draftUsageDaily = pgTable(
  'draft_usage_daily',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    day: varchar('day', { length: 10 }).notNull(),
    operatorId: varchar('operator_id', { length: 100 }).notNull().default('system'),
    used: integer('used').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    dayOperatorIdx: uniqueIndex('draft_usage_daily_day_operator_uidx').on(table.day, table.operatorId),
  }),
);
