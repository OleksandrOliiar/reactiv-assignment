import {
  createConfigurationRequestSchema,
  entityIdSchema,
  updateConfigurationRequestSchema,
} from '@reactiv/contracts';
import type { Request, Response } from 'express';
import { z } from 'zod';

import { parseRequest } from '../../common/http/parse-request';
import type { ConfigurationsService } from './configurations.service';

export const configurationIdParamsSchema = z.object({
  id: entityIdSchema,
});

export function createConfigurationsController(service: ConfigurationsService) {
  return {
    async get(req: Request, res: Response) {
      const { params } = parseRequest(req, { params: configurationIdParamsSchema });
      res.json(await service.get(params.id));
    },

    async create(req: Request, res: Response) {
      const { body } = parseRequest(req, { body: createConfigurationRequestSchema });
      const configuration = await service.create(body);
      res.status(201).location(`/v1/configurations/${configuration.id}`).json(configuration);
    },

    async update(req: Request, res: Response) {
      const { params, body } = parseRequest(req, {
        params: configurationIdParamsSchema,
        body: updateConfigurationRequestSchema,
      });
      res.json(await service.update(params.id, body));
    },
  };
}

export type ConfigurationsController = ReturnType<typeof createConfigurationsController>;
