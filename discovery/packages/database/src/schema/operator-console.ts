import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const operatorSavedViews = pgTable('operator_saved_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  operatorId: varchar('operator_id', { length: 100 }).notNull(),
  surface: varchar('surface', { length: 50 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  definition: jsonb('definition').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const bulkOperationLogs = pgTable('bulk_operation_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  operatorId: varchar('operator_id', { length: 100 }).notNull(),
  surface: varchar('surface', { length: 50 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull().unique(),
  selectionScope: varchar('selection_scope', { length: 30 }).notNull().default('explicit_ids'),
  selectionQuery: jsonb('selection_query').$type<Record<string, unknown> | null>(),
  requestedCount: integer('requested_count').notNull(),
  succeededCount: integer('succeeded_count').notNull().default(0),
  failedCount: integer('failed_count').notNull().default(0),
  results: jsonb('results').$type<Array<{ id: string; ok: boolean; error?: string }>>().notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
