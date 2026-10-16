import type { ConfigurationData } from '@reactiv/contracts';

export type ConfigurationRecord = {
  id: string;
  schemaVersion: number;
  version: number;
  data: ConfigurationData;
  createdAt: Date;
  updatedAt: Date;
};

export type ConfigurationInsert = Omit<ConfigurationRecord, 'createdAt'>;

export type ConfigurationUpdate = {
  schemaVersion: number;
  version: number;
  data: ConfigurationData;
  updatedAt: Date;
};

export interface ConfigurationsRepository {
  findById(id: string): Promise<ConfigurationRecord | null>;
  /** Returns null when the id is already stored. */
  insert(configuration: ConfigurationInsert): Promise<ConfigurationRecord | null>;
  /** Returns null when the row is missing or `expectedVersion` is stale. */
  updateIfVersion(
    id: string,
    expectedVersion: number,
    update: ConfigurationUpdate,
  ): Promise<ConfigurationRecord | null>;
}
