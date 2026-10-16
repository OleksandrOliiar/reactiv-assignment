import { randomUUID } from 'node:crypto';

import type { ConfigurationData } from '@reactiv/contracts';
import { CURRENT_SCHEMA_VERSION } from '@reactiv/contracts';

import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { toConfiguration } from './configurations.mapper';
import type { ConfigurationsRepository } from './configurations.repository';

type ServiceOptions = {
  now?: () => Date;
  createId?: () => string;
};

export class ConfigurationsService {
  private readonly now: () => Date;
  private readonly createId: () => string;

  constructor(
    private readonly repository: ConfigurationsRepository,
    options: ServiceOptions = {},
  ) {
    this.now = options.now ?? (() => new Date());
    this.createId = options.createId ?? randomUUID;
  }

  async get(id: string) {
    const record = await this.repository.findById(id);
    if (!record) throw new NotFoundError('Configuration not found');
    return toConfiguration(record);
  }

  async create(input: { id?: string; data: ConfigurationData }) {
    const id = input.id ?? this.createId();
    const record = await this.repository.insert({
      id,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      version: 1,
      data: input.data,
      updatedAt: this.now(),
    });

    if (!record) {
      throw new ConflictError('A configuration with this id already exists', [
        { path: 'id', message: 'Id already exists' },
      ]);
    }

    return toConfiguration(record);
  }

  async update(id: string, input: { version: number; data: ConfigurationData }) {
    const updated = await this.repository.updateIfVersion(id, input.version, {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      version: input.version + 1,
      data: input.data,
      updatedAt: this.now(),
    });
    if (updated) return toConfiguration(updated);

    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Configuration not found');

    throw new ConflictError('This configuration was changed elsewhere', [
      { path: 'version', message: `Current version is ${current.version}` },
    ]);
  }
}
