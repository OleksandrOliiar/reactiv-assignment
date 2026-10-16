import {
  createConfigurationRequestSchema,
  updateConfigurationRequestSchema,
} from '@reactiv/contracts';
import type { Request, Response } from 'express';

import type { ConfigurationsService } from './configurations.service';
import { configurationIdParamsSchema } from './configurations.routes';

export function createConfigurationsController(service: ConfigurationsService) {
  return {
    async get(req: Request, res: Response) {
      const params = configurationIdParamsSchema.parse(req.validated?.params);
      const configuration = await service.get(params.id);
      res.json(configuration);
    },

    async create(req: Request, res: Response) {
      const body = createConfigurationRequestSchema.parse(req.validated?.body);
      const configuration = await service.create(body);
      res.status(201).location(`/v1/configurations/${configuration.id}`).json(configuration);
    },

    async update(req: Request, res: Response) {
      const params = configurationIdParamsSchema.parse(req.validated?.params);
      const body = updateConfigurationRequestSchema.parse(req.validated?.body);
      const configuration = await service.update(params.id, body);
      res.json(configuration);
    },
  };
}

export type ConfigurationsController = ReturnType<typeof createConfigurationsController>;
