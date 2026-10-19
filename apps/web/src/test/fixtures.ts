import { defaultConfigurationData, type Configuration } from '@reactiv/contracts';

import type { LoadedConfiguration } from '@/features/editor/types/types';

export const savedConfiguration: Configuration = {
  id: 'default',
  schemaVersion: 1,
  version: 3,
  updatedAt: '2026-01-01T00:00:00.000Z',
  data: defaultConfigurationData,
};

export const loadedConfiguration: LoadedConfiguration = {
  configuration: savedConfiguration,
  isNew: false,
};
