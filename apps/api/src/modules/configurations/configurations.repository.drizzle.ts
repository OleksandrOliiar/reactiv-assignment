import { and, eq } from 'drizzle-orm';

import type { Database } from '../../common/db/client';
import { configurations } from './configurations.table';
import type {
  ConfigurationInsert,
  ConfigurationRecord,
  ConfigurationUpdate,
  ConfigurationsRepository,
} from './configurations.repository';

type ConfigurationRow = typeof configurations.$inferSelect;

export class DrizzleConfigurationsRepository implements ConfigurationsRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<ConfigurationRecord | null> {
    const [row] = await this.db
      .select()
      .from(configurations)
      .where(eq(configurations.id, id))
      .limit(1);
    return row ? toRecord(row) : null;
  }

  async insert(configuration: ConfigurationInsert): Promise<ConfigurationRecord | null> {
    const [row] = await this.db
      .insert(configurations)
      .values({
        id: configuration.id,
        schemaVersion: configuration.schemaVersion,
        version: configuration.version,
        data: configuration.data,
        createdAt: configuration.updatedAt,
        updatedAt: configuration.updatedAt,
      })
      .onConflictDoNothing({ target: configurations.id })
      .returning();
    return row ? toRecord(row) : null;
  }

  async updateIfVersion(
    id: string,
    expectedVersion: number,
    update: ConfigurationUpdate,
  ): Promise<ConfigurationRecord | null> {
    const [row] = await this.db
      .update(configurations)
      .set({
        schemaVersion: update.schemaVersion,
        version: update.version,
        data: update.data,
        updatedAt: update.updatedAt,
      })
      .where(and(eq(configurations.id, id), eq(configurations.version, expectedVersion)))
      .returning();
    return row ? toRecord(row) : null;
  }
}

function toRecord(row: ConfigurationRow): ConfigurationRecord {
  return {
    id: row.id,
    schemaVersion: row.schemaVersion,
    version: row.version,
    data: row.data,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
