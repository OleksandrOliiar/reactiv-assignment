import { createDefaultConfiguration } from '@reactiv/contracts';
import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';

import {
  ConfigServiceError,
  createConfigHttp,
  createConfigServiceClient,
} from './config-service-client';

const configuration = createDefaultConfiguration('default', '2026-01-01T00:00:00.000Z');
const apiKey = 'change-me-to-a-long-random-secret';

function http(handler: (config: InternalAxiosRequestConfig) => Promise<unknown>) {
  return axios.create({
    adapter: async (config) => {
      const data = await handler(config);
      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    },
  });
}

function responseError(status: number, data: unknown) {
  return new AxiosError('request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('createConfigHttp', () => {
  it('keeps the API key on the server client', () => {
    const instance = createConfigHttp({
      baseUrl: 'http://localhost:3001/',
      apiKey,
    });

    expect(instance.defaults.baseURL).toBe('http://localhost:3001');
    expect(AxiosHeaders.from(instance.defaults.headers).get('x-api-key')).toBe(apiKey);
  });
});

describe('createConfigServiceClient', () => {
  it('reads a configuration from the private service', async () => {
    const client = createConfigServiceClient({
      baseUrl: 'http://localhost:3001',
      apiKey,
      http: http(async (config) => {
        expect(config.url).toBe('/v1/configurations/default');
        expect(config.method).toBe('get');
        return configuration;
      }),
    });

    await expect(client.get('default')).resolves.toEqual(configuration);
  });

  it('creates and updates with the request bodies the API expects', async () => {
    const requests: { method?: string; url?: string; data: unknown }[] = [];
    const client = createConfigServiceClient({
      baseUrl: 'http://localhost:3001',
      apiKey,
      http: http(async (config) => {
        requests.push({ method: config.method, url: config.url, data: JSON.parse(config.data) });
        return configuration;
      }),
    });

    await client.create({ id: 'default', data: configuration.data });
    await client.update('home page', { version: 1, data: configuration.data });

    expect(requests).toEqual([
      {
        method: 'post',
        url: '/v1/configurations',
        data: { id: 'default', data: configuration.data },
      },
      {
        method: 'put',
        url: '/v1/configurations/home%20page',
        data: { version: 1, data: configuration.data },
      },
    ]);
  });

  it('rejects a response that is not a configuration', async () => {
    const client = createConfigServiceClient({
      baseUrl: 'http://localhost:3001',
      apiKey,
      http: http(async () => ({ id: 'default' })),
    });

    await expect(client.get('default')).rejects.toMatchObject({ status: 502, code: 'INTERNAL' });
  });

  it('keeps the status of an error response with an unexpected body', async () => {
    const client = createConfigServiceClient({
      baseUrl: 'http://localhost:3001',
      apiKey,
      http: axios.create({
        adapter: async () => {
          throw responseError(500, '<html>Bad gateway</html>');
        },
      }),
    });

    await expect(client.get('default')).rejects.toMatchObject({
      status: 500,
      code: 'INTERNAL',
      message: 'Configuration service request failed',
    });
  });

  it('turns a service error into a typed error without echoing the key', async () => {
    const failing = axios.create({
      adapter: async () => {
        throw responseError(404, {
          error: { code: 'NOT_FOUND', message: 'Configuration not found' },
        });
      },
    });

    const client = createConfigServiceClient({
      baseUrl: 'http://localhost:3001',
      apiKey,
      http: failing,
    });

    try {
      await client.get('missing');
      expect.fail('expected the missing configuration to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigServiceError);
      expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND' });
      expect(JSON.stringify(error)).not.toContain(apiKey);
    }
  });

  it('hides an unreachable service', async () => {
    const failing = axios.create({
      adapter: async () => {
        throw new AxiosError('timeout', 'ECONNABORTED');
      },
    });

    const client = createConfigServiceClient({
      baseUrl: 'http://localhost:3001',
      apiKey,
      http: failing,
    });

    await expect(client.get('default')).rejects.toMatchObject({
      status: 503,
      message: 'Configuration service timed out',
    });
  });
});
