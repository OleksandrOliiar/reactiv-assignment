import {
  createConfigurationRequestSchema,
  entityIdSchema,
  updateConfigurationRequestSchema,
} from '@reactiv/contracts';
import { Router } from 'express';
import { z } from 'zod';

import { validate } from '../../common/middleware/validate';
import type { ConfigurationsController } from './configurations.controller';

export const configurationIdParamsSchema = z.object({
  id: entityIdSchema,
});

export type ConfigurationIdParams = z.infer<typeof configurationIdParamsSchema>;

export function createConfigurationsRoutes(controller: ConfigurationsController) {
  const router = Router();

  router.get(
    '/configurations/:id',
    validate({ params: configurationIdParamsSchema }),
    (req, res, next) => {
      controller.get(req, res).catch(next);
    },
  );

  router.post(
    '/configurations',
    validate({ body: createConfigurationRequestSchema }),
    (req, res, next) => {
      controller.create(req, res).catch(next);
    },
  );

  router.put(
    '/configurations/:id',
    validate({ params: configurationIdParamsSchema, body: updateConfigurationRequestSchema }),
    (req, res, next) => {
      controller.update(req, res).catch(next);
    },
  );

  return router;
}
