import type {
  ConfigurationInsert,
  ConfigurationRecord,
  ConfigurationUpdate,
  ConfigurationsRepository,
} from './configurations.repository';

export class MemoryConfigurationsRepository implements ConfigurationsRepository {
  private readonly rows = new Map<string, ConfigurationRecord>();

  async findById(id: string): Promise<ConfigurationRecord | null> {
    const row = this.rows.get(id);
    return row ? clone(row) : null;
  }

  async insert(configuration: ConfigurationInsert): Promise<ConfigurationRecord | null> {
    if (this.rows.has(configuration.id)) return null;

    const row: ConfigurationRecord = {
      ...clone(configuration),
      createdAt: configuration.updatedAt,
    };
    this.rows.set(row.id, row);
    return clone(row);
  }

  async updateIfVersion(
    id: string,
    expectedVersion: number,
    update: ConfigurationUpdate,
  ): Promise<ConfigurationRecord | null> {
    const current = this.rows.get(id);
    if (!current || current.version !== expectedVersion) return null;

    const row: ConfigurationRecord = {
      ...current,
      ...clone(update),
    };
    this.rows.set(id, row);
    return clone(row);
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
