import express from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';

import { createErrorHandler } from './common/errors/error-handler';
import { createRequestLogger } from './common/logger';
import { createApiKeyAuth } from './common/middleware/api-key-auth';
import { notFoundHandler } from './common/middleware/not-found';
import { createDocsRouter } from './common/openapi/docs.router';
import { createHealthRouter } from './modules/health/health.routes';
import { createConfigurationsRouter } from './modules/configurations/configurations.module';
import type { ConfigurationsRepository } from './modules/configurations/configurations.repository';

export type CreateAppDependencies = {
  configurationsRepository: ConfigurationsRepository;
  apiKey: string;
  logger: Logger;
};

export function createApp({ configurationsRepository, apiKey, logger }: CreateAppDependencies) {
  const app = express();
  // Express sets `X-Powered-By: Express` before middleware runs. Helmet strips it only
  // for requests that reach it, so this keeps the header off every response.
  app.disable('x-powered-by');
  app.use(createRequestLogger(logger));
  app.use(helmet());
  // A screen filled to every contract limit is about 430 kB of JSON.
  app.use(express.json({ limit: '1mb' }));

  app.use(createDocsRouter());
  app.use('/health', createHealthRouter());

  const v1 = express.Router();
  v1.use(createApiKeyAuth(apiKey));
  v1.use(createConfigurationsRouter(configurationsRepository));
  app.use('/v1', v1);

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));
  return app;
}
