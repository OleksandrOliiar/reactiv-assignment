import { Router } from 'express';

import type { ConfigurationsController } from './configurations.controller';

export function createConfigurationsRoutes(controller: ConfigurationsController) {
  const router = Router();
  router.get('/configurations/:id', controller.get);
  router.post('/configurations', controller.create);
  router.put('/configurations/:id', controller.update);
  return router;
}
