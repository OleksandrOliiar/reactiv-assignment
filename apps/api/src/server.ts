import { createApp } from './app';
import { loadEnvOrExit } from './common/config/env';
import { createDb } from './common/db/client';
import { runMigrations } from './common/db/migrate';
import { seedDefaultConfiguration } from './common/db/seed';
import { createLogger } from './common/logger';
import { DrizzleConfigurationsRepository } from './modules/configurations/configurations.repository.drizzle';

const env = loadEnvOrExit();
const logger = createLogger(env.LOG_LEVEL);
const { db, pool } = createDb(env.DATABASE_URL);

try {
  await runMigrations(db);
  const seed = await seedDefaultConfiguration(db, env.DEFAULT_CONFIG_ID);
  logger.info(seed, 'Default configuration ready');
} catch (error) {
  logger.error({ err: error }, 'Failed to start');
  await pool.end();
  process.exit(1);
}

const app = createApp({
  configurationsRepository: new DrizzleConfigurationsRepository(db),
  apiKey: env.API_KEY,
  logger,
});

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Configuration service listening');
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    logger.info({ signal }, 'Shutting down');
    server.close(() => {
      pool.end().then(
        () => process.exit(0),
        () => process.exit(1),
      );
    });
  });
}
