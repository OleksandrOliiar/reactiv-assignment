import type {
  ConfigurationInsert,
  ConfigurationRecord,
  ConfigurationUpdate,
  ConfigurationsRepository,
} from './configurations.repository';

/** Copies on the way in and out so callers can't mutate stored rows, like a real database. */
export class MemoryConfigurationsRepository implements ConfigurationsRepository {
  private readonly rows = new Map<string, ConfigurationRecord>();

  async findById(id: string): Promise<ConfigurationRecord | null> {
    const row = this.rows.get(id);
    return row ? structuredClone(row) : null;
  }

  async insert(configuration: ConfigurationInsert): Promise<ConfigurationRecord | null> {
    if (this.rows.has(configuration.id)) return null;

    const row = structuredClone({ ...configuration, createdAt: configuration.updatedAt });
    this.rows.set(row.id, row);
    return structuredClone(row);
  }

  async updateIfVersion(
    id: string,
    expectedVersion: number,
    update: ConfigurationUpdate,
  ): Promise<ConfigurationRecord | null> {
    const current = this.rows.get(id);
    if (!current || current.version !== expectedVersion) return null;

    const row = structuredClone({ ...current, ...update });
    this.rows.set(id, row);
    return structuredClone(row);
  }
}
