import { defaultConfigurationData } from '@reactiv/contracts';
import { describe, expect, it } from 'vitest';

import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { MemoryConfigurationsRepository } from './configurations.repository.memory';
import { ConfigurationsService } from './configurations.service';

const now = new Date('2026-01-01T00:00:00.000Z');

function createService() {
  return new ConfigurationsService(new MemoryConfigurationsRepository(), {
    now: () => now,
    createId: () => 'generated-id',
  });
}

describe('ConfigurationsService', () => {
  it('creates version 1 and loads it back', async () => {
    const service = createService();
    const created = await service.create({ data: defaultConfigurationData });

    expect(created).toMatchObject({
      id: 'generated-id',
      schemaVersion: 1,
      version: 1,
      updatedAt: now.toISOString(),
    });
    expect(await service.get(created.id)).toEqual(created);
  });

  it('rejects a duplicate id and a missing configuration', async () => {
    const service = createService();
    await service.create({ id: 'default', data: defaultConfigurationData });

    await expect(
      service.create({ id: 'default', data: defaultConfigurationData }),
    ).rejects.toBeInstanceOf(ConflictError);
    await expect(service.get('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('replaces the document and rejects a stale version', async () => {
    const service = createService();
    const created = await service.create({ id: 'default', data: defaultConfigurationData });
    const replacement = {
      sections: [defaultConfigurationData.sections[1]].filter((section) => section !== undefined),
    };

    const saved = await service.update(created.id, { version: 1, data: replacement });
    expect(saved.version).toBe(2);
    expect(saved.data).toEqual(replacement);

    await expect(
      service.update(created.id, { version: 1, data: replacement }),
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      details: [{ path: 'version', message: 'Current version is 2' }],
    });
    expect((await service.get(created.id)).data).toEqual(replacement);
    await expect(
      service.update('missing', { version: 1, data: replacement }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
