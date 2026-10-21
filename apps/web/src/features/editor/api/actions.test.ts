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
const draft = { id: 'default', version: 1, isNew: false, data: defaultConfigurationData };
const UNAVAILABLE = 'The configuration service is unavailable.';

beforeEach(() => {
  get.mockReset();
  create.mockReset();
  update.mockReset();
});

describe('saveConfiguration action', () => {
  it('saves through the service and returns the saved configuration', async () => {
    const { saveConfiguration } = await import('./actions');
    update.mockResolvedValue({ ...configuration, version: 2 });

    const result = await saveConfiguration(draft);

    expect(result).toEqual({ status: 'saved', configuration: { ...configuration, version: 2 } });
    expect(JSON.stringify(update.mock.calls)).not.toContain('change-me-to-a-long-random-secret');
  });

  it('rejects an invalid draft without calling the service', async () => {
    const { saveConfiguration } = await import('./actions');

    await expect(
      saveConfiguration({ ...draft, data: { sections: 'nope' } }),
    ).resolves.toMatchObject({ status: 'invalid' });
    expect(update).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('hides unexpected failures behind a plain error', async () => {
    const { saveConfiguration } = await import('./actions');
    update.mockRejectedValue(new ConfigServiceError(503, 'INTERNAL', 'Down'));

    await expect(saveConfiguration(draft)).rejects.toThrow(UNAVAILABLE);
  });
});

describe('overwriteConfiguration action', () => {
  it('saves at the version stored now', async () => {
    const { overwriteConfiguration } = await import('./actions');
    get.mockResolvedValue({ ...configuration, version: 5 });
    update.mockResolvedValue({ ...configuration, version: 6 });

    await expect(overwriteConfiguration({ ...draft, version: 2 })).resolves.toMatchObject({
      status: 'saved',
    });
    expect(update).toHaveBeenCalledWith('default', { version: 5, data: defaultConfigurationData });
  });

  it('hides failures reading the latest version', async () => {
    const { overwriteConfiguration } = await import('./actions');
    get.mockRejectedValue(new ConfigServiceError(503, 'INTERNAL', 'Down'));

    await expect(overwriteConfiguration(draft)).rejects.toThrow(UNAVAILABLE);
  });
});

describe('loadLatestConfiguration action', () => {
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

    await expect(loadLatestConfiguration('default')).rejects.toThrow(UNAVAILABLE);
  });
});
