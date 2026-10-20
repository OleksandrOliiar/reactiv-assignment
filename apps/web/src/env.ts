import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';

import { entityIdSchema } from '@reactiv/contracts';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// `next dev` runs in apps/web, but the shared .env lives at the repo root.
// `loadEnvFile` never overrides variables that are already set.
const rootEnvPath = path.resolve(process.cwd(), '..', '..', '.env');
if (existsSync(rootEnvPath)) {
  loadEnvFile(rootEnvPath);
}

export const serverEnvSchema = {
  CONFIG_SERVICE_URL: z.url({ error: 'CONFIG_SERVICE_URL must be an absolute URL' }),
  CONFIG_SERVICE_API_KEY: z
    .string()
    .min(16, { error: 'CONFIG_SERVICE_API_KEY must be at least 16 characters' }),
  DEFAULT_CONFIG_ID: entityIdSchema.default('default'),
};

export const env = createEnv({
  server: serverEnvSchema,
  runtimeEnv: {
    CONFIG_SERVICE_URL: process.env.CONFIG_SERVICE_URL,
    CONFIG_SERVICE_API_KEY: process.env.CONFIG_SERVICE_API_KEY,
    DEFAULT_CONFIG_ID: process.env.DEFAULT_CONFIG_ID,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.VITEST === 'true' || process.env.SKIP_ENV_VALIDATION === 'true',
});
