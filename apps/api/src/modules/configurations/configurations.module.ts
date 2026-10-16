import type { ConfigurationsRepository } from './configurations.repository';
import { createConfigurationsController } from './configurations.controller';
import { createConfigurationsRoutes } from './configurations.routes';
import { ConfigurationsService } from './configurations.service';

import './configurations.openapi';

export function createConfigurationsRouter(repository: ConfigurationsRepository) {
  const service = new ConfigurationsService(repository);
  return createConfigurationsRoutes(createConfigurationsController(service));
}
