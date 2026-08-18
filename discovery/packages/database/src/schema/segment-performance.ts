import { integer, pgTable, real, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/** Aggregated closed-won/lost performance by segment (C8). */
export const segmentPerformance = pgTable('segment_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  segmentKey: varchar('segment_key', { length: 240 }).notNull().unique(),
  industry: varchar('industry', { length: 200 }),
  city: varchar('city', { length: 100 }),
  presenceClass: varchar('presence_class', { length: 40 }),
  primaryGap: varchar('primary_gap', { length: 80 }),
  wonCount: integer('won_count').notNull().default(0),
  lostCount: integer('lost_count').notNull().default(0),
  sampleSize: integer('sample_size').notNull().default(0),
  winRate: real('win_rate').notNull().default(0),
  avgProjectValueUgx: real('avg_project_value_ugx'),
  avgDaysToClose: real('avg_days_to_close'),
  adjustment: integer('adjustment').notNull().default(0),
  label: text('label'),
  refreshedAt: timestamp('refreshed_at', { withTimezone: true }).defaultNow().notNull(),
});
