import {
  createDefaultConfiguration,
  defaultConfigurationData,
  type Configuration,
} from '@reactiv/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ConfigServiceError, type ConfigServiceClient } from './config-service-client';
import {
  findConfiguration,
  loadConfiguration,
  overwriteDraft,
  saveDraft,
} from './configuration-service';

const stored: Configuration = createDefaultConfiguration('default', '2026-01-01T00:00:00.000Z');

function client(overrides: Partial<ConfigServiceClient> = {}): ConfigServiceClient {
  return {
    get: vi.fn(async () => stored),
    create: vi.fn(async () => stored),
    update: vi.fn(async () => stored),
    ...overrides,
  };
}

function failing(status: number, code: ConfigServiceError['code'], message = 'Failed') {
  return async (): Promise<never> => {
    throw new ConfigServiceError(status, code, message);
  };
}

const draft = { id: 'default', version: 1, isNew: false, data: defaultConfigurationData };

describe('findConfiguration', () => {
  it('returns null when the id does not exist', async () => {
    await expect(
      findConfiguration('default', client({ get: failing(404, 'NOT_FOUND') })),
    ).resolves.toBeNull();
  });

  it('rethrows other failures', async () => {
    await expect(
      findConfiguration('default', client({ get: failing(503, 'INTERNAL') })),
    ).rejects.toMatchObject({ status: 503 });
  });
});

describe('loadConfiguration', () => {
  it('returns a stored configuration', async () => {
    const result = await loadConfiguration('default', client());
    expect(result).toEqual({ configuration: stored, isNew: false });
  });

  it('falls back to the default screen when the id is missing', async () => {
    const result = await loadConfiguration('default', client({ get: failing(404, 'NOT_FOUND') }));

    expect(result.isNew).toBe(true);
    expect(result.configuration.id).toBe('default');
    expect(result.configuration.data).toEqual(defaultConfigurationData);
  });

  it('rethrows when the service is unavailable', async () => {
    await expect(
      loadConfiguration('default', client({ get: failing(503, 'INTERNAL') })),
    ).rejects.toMatchObject({ status: 503 });
  });
});

describe('saveDraft', () => {
  it('updates at the version the draft was based on', async () => {
    const saved = { ...stored, version: 2 };
    const http = client({ update: vi.fn(async () => saved) });

    await expect(saveDraft(draft, http)).resolves.toEqual({
      status: 'saved',
      configuration: saved,
    });
    expect(http.update).toHaveBeenCalledWith('default', {
      version: 1,
      data: defaultConfigurationData,
    });
    expect(http.create).not.toHaveBeenCalled();
  });

  it('creates when the draft is marked new', async () => {
    const http = client();

    await expect(saveDraft({ ...draft, isNew: true }, http)).resolves.toMatchObject({
      status: 'saved',
    });
    expect(http.create).toHaveBeenCalledWith({ id: 'default', data: defaultConfigurationData });
    expect(http.update).not.toHaveBeenCalled();
  });

  it.each([
    ['CONFLICT', 409, 'conflict'],
    ['NOT_FOUND', 404, 'not_found'],
  ] as const)('returns a %s failure as a %s result', async (code, status, result) => {
    const http = client({ update: failing(status, code) });
    await expect(saveDraft(draft, http)).resolves.toMatchObject({ status: result });
  });

  it('maps validation details onto the section that owns them', async () => {
    const http = client({
      update: async () => {
        throw new ConfigServiceError(400, 'VALIDATION_ERROR', 'Invalid request', [
          { path: 'body.data.sections.2.url', message: 'Enter an http or https URL' },
        ]);
      },
    });

    await expect(saveDraft(draft, http)).resolves.toEqual({
      status: 'invalid',
      message: 'Invalid request',
      errors: { 'welcome-cta': { url: 'Enter an http or https URL' } },
    });
  });

  it('rethrows failures the editor cannot show', async () => {
    const http = client({ update: failing(503, 'INTERNAL') });
    await expect(saveDraft(draft, http)).rejects.toMatchObject({ status: 503 });
  });
});

describe('overwriteDraft', () => {
  it('saves the draft at the version stored now', async () => {
    const http = client({ get: vi.fn(async () => ({ ...stored, version: 5 })) });

    await expect(overwriteDraft({ ...draft, version: 2 }, http)).resolves.toMatchObject({
      status: 'saved',
    });
    expect(http.update).toHaveBeenCalledWith('default', {
      version: 5,
      data: defaultConfigurationData,
    });
  });

  it('creates the screen when it was deleted', async () => {
    const http = client({ get: failing(404, 'NOT_FOUND') });

    await expect(overwriteDraft(draft, http)).resolves.toMatchObject({ status: 'saved' });
    expect(http.create).toHaveBeenCalledWith({ id: 'default', data: defaultConfigurationData });
    expect(http.update).not.toHaveBeenCalled();
  });

  it('rethrows when the latest version cannot be read', async () => {
    const http = client({ get: failing(503, 'INTERNAL') });

    await expect(overwriteDraft(draft, http)).rejects.toMatchObject({ status: 503 });
    expect(http.update).not.toHaveBeenCalled();
  });
});
