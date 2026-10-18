import {
  createDefaultConfiguration,
  defaultConfigurationData,
  type Configuration,
} from '@reactiv/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ConfigServiceError, type ConfigServiceClient } from './config-service-client';
import { loadConfiguration } from './load-configuration';

const stored: Configuration = createDefaultConfiguration('default', '2026-01-01T00:00:00.000Z');

function client(overrides: Partial<ConfigServiceClient> = {}): ConfigServiceClient {
  return {
    get: vi.fn(async () => stored),
    create: vi.fn(async () => stored),
    update: vi.fn(async () => stored),
    ...overrides,
  };
}

describe('loadConfiguration', () => {
  it('returns a stored configuration', async () => {
    const result = await loadConfiguration('default', client());
    expect(result).toEqual({ configuration: stored, isNew: false });
  });

  it('falls back to the default screen when the id is missing', async () => {
    const result = await loadConfiguration(
      'default',
      client({
        get: async () => {
          throw new ConfigServiceError(404, 'NOT_FOUND', 'Configuration not found');
        },
      }),
    );

    expect(result.isNew).toBe(true);
    expect(result.configuration.id).toBe('default');
    expect(result.configuration.data).toEqual(defaultConfigurationData);
  });

  it('rethrows when the service is unavailable', async () => {
    await expect(
      loadConfiguration(
        'default',
        client({
          get: async () => {
            throw new ConfigServiceError(503, 'INTERNAL', 'Configuration service is unavailable');
          },
        }),
      ),
    ).rejects.toMatchObject({ status: 503 });
  });
});
