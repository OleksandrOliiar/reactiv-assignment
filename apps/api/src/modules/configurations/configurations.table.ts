import type { ConfigurationData } from '@reactiv/contracts';
import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const configurations = pgTable('configurations', {
  id: text('id').primaryKey(),
  schemaVersion: integer('schema_version').notNull(),
  version: integer('version').notNull(),
  data: jsonb('data').$type<ConfigurationData>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});
