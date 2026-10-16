import {
  CURRENT_SCHEMA_VERSION,
  configurationSchema,
  migrateConfigurationData,
} from '@reactiv/contracts';

import type { ConfigurationRecord } from './configurations.repository';

export function toConfiguration(record: ConfigurationRecord) {
  return configurationSchema.parse({
    id: record.id,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    version: record.version,
    updatedAt: record.updatedAt.toISOString(),
    data: migrateConfigurationData(record.data, record.schemaVersion),
  });
}
