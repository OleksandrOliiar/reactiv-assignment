import { entityIdSchema } from '@reactiv/contracts';
import { z } from 'zod';

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: 'DATABASE_URL must be a postgres connection URL',
  }),
  API_KEY: z.string().min(16, { error: 'API_KEY must be at least 16 characters' }),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DEFAULT_CONFIG_ID: entityIdSchema.default('default'),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (issue) => `- ${issue.path.join('.') || 'environment'}: ${issue.message}`,
    );
    throw new Error(`Invalid environment variables:\n${lines.join('\n')}`);
  }
  return parsed.data;
}

/** Load `.env` when present, then exit if the environment is invalid. */
export function loadEnvOrExit(source: NodeJS.ProcessEnv = process.env): Env {
  loadDotEnvFile();

  try {
    return loadEnv(source);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function loadDotEnvFile(): void {
  try {
    process.loadEnvFile();
  } catch (error) {
    if (isMissingFile(error)) return;
    throw error;
  }
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
