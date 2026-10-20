import { and, eq } from 'drizzle-orm';

import type { Database } from '../../common/db/client';
import { configurations } from './configurations.table';
import type {
  ConfigurationInsert,
  ConfigurationRecord,
  ConfigurationUpdate,
  ConfigurationsRepository,
} from './configurations.repository';

export class DrizzleConfigurationsRepository implements ConfigurationsRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<ConfigurationRecord | null> {
    const [row] = await this.db
      .select()
      .from(configurations)
      .where(eq(configurations.id, id))
      .limit(1);
    return row ?? null;
  }

  async insert(configuration: ConfigurationInsert): Promise<ConfigurationRecord | null> {
    const [row] = await this.db
      .insert(configurations)
      .values({ ...configuration, createdAt: configuration.updatedAt })
      .onConflictDoNothing({ target: configurations.id })
      .returning();
    return row ?? null;
  }

  async updateIfVersion(
    id: string,
    expectedVersion: number,
    update: ConfigurationUpdate,
  ): Promise<ConfigurationRecord | null> {
    const [row] = await this.db
      .update(configurations)
      .set(update)
      .where(and(eq(configurations.id, id), eq(configurations.version, expectedVersion)))
      .returning();
    return row ?? null;
  }
}
