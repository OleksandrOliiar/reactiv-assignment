import { createDefaultConfiguration } from '@reactiv/contracts';
import 'server-only';

import { env } from '@/env';
import {
  ConfigServiceError,
  createConfigServiceClient,
  type ConfigServiceClient,
} from '@/features/configuration/api/config-service-client';
import type { LoadedConfiguration } from '@/features/configuration/types';

export async function loadConfiguration(
  id: string,
  client: ConfigServiceClient = defaultClient(),
): Promise<LoadedConfiguration> {
  try {
    return { configuration: await client.get(id), isNew: false };
  } catch (error) {
    if (error instanceof ConfigServiceError && error.status === 404) {
      return {
        configuration: createDefaultConfiguration(id, new Date().toISOString()),
        isNew: true,
      };
    }
    throw error;
  }
}

function defaultClient(): ConfigServiceClient {
  return createConfigServiceClient({
    baseUrl: env.CONFIG_SERVICE_URL,
    apiKey: env.CONFIG_SERVICE_API_KEY,
  });
}
