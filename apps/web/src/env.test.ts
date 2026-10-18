import { z } from 'zod';
import { describe, expect, it } from 'vitest';

import { serverEnvSchema } from './env';

const schema = z.object(serverEnvSchema);
const valid = {
  CONFIG_SERVICE_URL: 'http://localhost:3001',
  CONFIG_SERVICE_API_KEY: 'change-me-to-a-long-random-secret',
};

describe('serverEnvSchema', () => {
  it('defaults the configuration id', () => {
    expect(schema.parse(valid)).toMatchObject({
      CONFIG_SERVICE_URL: 'http://localhost:3001',
      DEFAULT_CONFIG_ID: 'default',
    });
  });

  it('rejects a short API key and a relative service URL', () => {
    expect(() => schema.parse({ ...valid, CONFIG_SERVICE_API_KEY: 'short' })).toThrow(/API_KEY/);
    expect(() => schema.parse({ ...valid, CONFIG_SERVICE_URL: '/api' })).toThrow(
      /CONFIG_SERVICE_URL/,
    );
  });
});
