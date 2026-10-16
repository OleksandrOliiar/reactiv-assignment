import { createLogger } from '../logger';
import { loadEnvOrExit } from '../config/env';
import { createDb } from './client';
import { runMigrations } from './migrate';
import { seedDefaultConfiguration } from './seed';

const env = loadEnvOrExit();
const logger = createLogger(env.LOG_LEVEL);
const { db, pool } = createDb(env.DATABASE_URL);

try {
  await runMigrations(db);
  const result = await seedDefaultConfiguration(db, env.DEFAULT_CONFIG_ID);
  logger.info(result, 'Seed finished');
} finally {
  await pool.end();
}
