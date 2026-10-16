import { createDefaultConfiguration } from '@reactiv/contracts';

import { configurations } from '../../modules/configurations/configurations.table';
import type { Database } from './client';

/** Insert the seeded configuration when its id is free. Existing rows are left untouched. */
export async function seedDefaultConfiguration(db: Database, id: string, now = new Date()) {
  const configuration = createDefaultConfiguration(id, now.toISOString());
  const inserted = await db
    .insert(configurations)
    .values({
      id: configuration.id,
      schemaVersion: configuration.schemaVersion,
      version: configuration.version,
      data: configuration.data,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: configurations.id })
    .returning({ id: configurations.id });

  return { created: inserted.length > 0 };
}
