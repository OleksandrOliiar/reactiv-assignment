import { createDefaultConfiguration, defaultConfigurationData } from '@reactiv/contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigServiceError, type ConfigServiceClient } from './config-service-client';

const get = vi.fn();
const create = vi.fn();
const update = vi.fn();

vi.mock('@/features/editor/api/config-service-client', async () => {
  const actual =
    await vi.importActual<typeof import('./config-service-client')>('./config-service-client');
  return {
    ...actual,
    configServiceClient: (): ConfigServiceClient => ({ get, create, update }),
  };
});

const configuration = createDefaultConfiguration('default', '2026-01-01T00:00:00.000Z');

describe('saveConfiguration action', () => {
  beforeEach(() => {
    get.mockReset();
    create.mockReset();
    update.mockReset();
  });

  it('updates an existing screen and returns the saved configuration', async () => {
    const { saveConfiguration } = await import('./actions');
    update.mockResolvedValue({ ...configuration, version: 2 });

    await expect(
      saveConfiguration({
        id: 'default',
        version: 1,
        isNew: false,
        data: defaultConfigurationData,
      }),
    ).resolves.toEqual({
      status: 'saved',
      configuration: { ...configuration, version: 2 },
    });

    expect(update).toHaveBeenCalledWith('default', {
      version: 1,
      data: defaultConfigurationData,
    });
    expect(JSON.stringify(update.mock.calls)).not.toContain('change-me-to-a-long-random-secret');
  });

  it('creates when the draft is marked new', async () => {
    const { saveConfiguration } = await import('./actions');
    create.mockResolvedValue(configuration);

    await expect(
      saveConfiguration({
        id: 'default',
        version: 1,
        isNew: true,
        data: defaultConfigurationData,
      }),
    ).resolves.toMatchObject({ status: 'saved' });

    expect(create).toHaveBeenCalledWith({ id: 'default', data: defaultConfigurationData });
  });

  it('returns a conflict result when the service reports a version mismatch', async () => {
    const { saveConfiguration } = await import('./actions');
    update.mockRejectedValue(new ConfigServiceError(409, 'CONFLICT', 'Version mismatch'));

    await expect(
      saveConfiguration({
        id: 'default',
        version: 1,
        isNew: false,
        data: defaultConfigurationData,
      }),
    ).resolves.toMatchObject({ status: 'conflict' });
  });

  it('throws a plain error for unexpected failures', async () => {
    const { saveConfiguration } = await import('./actions');
    update.mockRejectedValue(new ConfigServiceError(503, 'INTERNAL', 'Down'));

    await expect(
      saveConfiguration({
        id: 'default',
        version: 1,
        isNew: false,
        data: defaultConfigurationData,
      }),
    ).rejects.toThrow('The configuration service is unavailable.');
  });

  it('rejects an invalid draft without calling the service', async () => {
    const { saveConfiguration } = await import('./actions');

    await expect(
      saveConfiguration({ id: 'default', version: 1, isNew: false, data: { sections: 'nope' } }),
    ).resolves.toMatchObject({ status: 'invalid' });
    expect(update).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});

describe('overwriteConfiguration action', () => {
  beforeEach(() => {
    get.mockReset();
    create.mockReset();
    update.mockReset();
  });

  it('saves the draft at the version stored now', async () => {
    const { overwriteConfiguration } = await import('./actions');
    get.mockResolvedValue({ ...configuration, version: 5 });
    update.mockResolvedValue({ ...configuration, version: 6 });

    await expect(
      overwriteConfiguration({
        id: 'default',
        version: 2,
        isNew: false,
        data: defaultConfigurationData,
      }),
    ).resolves.toMatchObject({ status: 'saved' });

    expect(update).toHaveBeenCalledWith('default', {
      version: 5,
      data: defaultConfigurationData,
    });
  });

  it('creates the screen when it was deleted', async () => {
    const { overwriteConfiguration } = await import('./actions');
    get.mockRejectedValue(new ConfigServiceError(404, 'NOT_FOUND', 'Missing'));
    create.mockResolvedValue(configuration);

    await expect(
      overwriteConfiguration({
        id: 'default',
        version: 2,
        isNew: false,
        data: defaultConfigurationData,
      }),
    ).resolves.toMatchObject({ status: 'saved' });

    expect(create).toHaveBeenCalledWith({ id: 'default', data: defaultConfigurationData });
  });
});

describe('loadLatestConfiguration action', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('loads the current configuration', async () => {
    const { loadLatestConfiguration } = await import('./actions');
    get.mockResolvedValue(configuration);

    await expect(loadLatestConfiguration('default')).resolves.toEqual(configuration);
  });

  it('refuses an invalid id before calling the service', async () => {
    const { loadLatestConfiguration } = await import('./actions');

    await expect(loadLatestConfiguration('../etc')).rejects.toThrow(
      'The configuration id is invalid.',
    );
    expect(get).not.toHaveBeenCalled();
  });

  it('returns null for a missing configuration', async () => {
    const { loadLatestConfiguration } = await import('./actions');
    get.mockRejectedValue(new ConfigServiceError(404, 'NOT_FOUND', 'Missing'));

    await expect(loadLatestConfiguration('default')).resolves.toBeNull();
  });

  it('hides other failures behind a plain error', async () => {
    const { loadLatestConfiguration } = await import('./actions');
    get.mockRejectedValue(new ConfigServiceError(503, 'INTERNAL', 'Down'));

    await expect(loadLatestConfiguration('default')).rejects.toThrow(
      'The configuration service is unavailable.',
    );
  });
});
