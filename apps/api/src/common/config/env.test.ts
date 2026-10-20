import { describe, expect, it } from 'vitest';

import { loadEnv } from './env';

const valid = {
  DATABASE_URL: 'postgres://reactiv:reactiv@localhost:5432/reactiv',
  API_KEY: 'change-me-to-a-long-random-secret',
};

describe('loadEnv', () => {
  it('applies defaults for port, log level, and config id', () => {
    expect(loadEnv(valid)).toMatchObject({
      PORT: 3001,
      LOG_LEVEL: 'info',
      DEFAULT_CONFIG_ID: 'default',
      API_KEY: valid.API_KEY,
    });
  });

  it('accepts a postgresql URL and an explicit port', () => {
    const env = loadEnv({
      ...valid,
      DATABASE_URL: 'postgresql://localhost/reactiv',
      PORT: '4000',
      DEFAULT_CONFIG_ID: 'home',
    });
    expect(env.PORT).toBe(4000);
    expect(env.DEFAULT_CONFIG_ID).toBe('home');
  });

  it('rejects a short API key, a non-postgres URL, and a bad port', () => {
    expect(() => loadEnv({ ...valid, API_KEY: 'too-short' })).toThrow(/API_KEY/);
    expect(() => loadEnv({ ...valid, DATABASE_URL: 'https://example.com' })).toThrow(
      /DATABASE_URL/,
    );
    expect(() => loadEnv({ ...valid, PORT: '70000' })).toThrow(/PORT/);
  });
});
