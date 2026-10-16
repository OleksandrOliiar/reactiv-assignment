import type { CreateConfigurationRequest, UpdateConfigurationRequest } from '@reactiv/contracts';
import type { Request, Response } from 'express';

import { readValidated } from '../../common/middleware/validate';
import type { ConfigurationIdParams } from './configurations.routes';
import type { ConfigurationsService } from './configurations.service';

export function createConfigurationsController(service: ConfigurationsService) {
  return {
    async get(req: Request, res: Response) {
      const { params } = readValidated<ConfigurationIdParams, unknown>(req);
      const configuration = await service.get(params.id);
      res.json(configuration);
    },

    async create(req: Request, res: Response) {
      const { body } = readValidated<unknown, CreateConfigurationRequest>(req);
      const configuration = await service.create(body);
      res.status(201).location(`/v1/configurations/${configuration.id}`).json(configuration);
    },

    async update(req: Request, res: Response) {
      const { params, body } = readValidated<ConfigurationIdParams, UpdateConfigurationRequest>(
        req,
      );
      const configuration = await service.update(params.id, body);
      res.json(configuration);
    },
  };
}

export type ConfigurationsController = ReturnType<typeof createConfigurationsController>;
