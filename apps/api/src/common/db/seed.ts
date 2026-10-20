import { CURRENT_SCHEMA_VERSION, defaultConfigurationData } from '@reactiv/contracts';

import { DrizzleConfigurationsRepository } from '../../modules/configurations/configurations.repository.drizzle';
import type { Database } from './client';

/** Insert the seeded configuration when its id is free. Existing rows are left untouched. */
export async function seedDefaultConfiguration(db: Database, id: string, now = new Date()) {
  const inserted = await new DrizzleConfigurationsRepository(db).insert({
    id,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    version: 1,
    data: defaultConfigurationData,
    updatedAt: now,
  });
  return { created: inserted !== null };
}
