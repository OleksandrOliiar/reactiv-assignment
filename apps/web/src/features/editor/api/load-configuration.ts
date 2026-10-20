import { createDefaultConfiguration, type Configuration } from '@reactiv/contracts';
import 'server-only';

import { env } from '@/env';
import {
  ConfigServiceError,
  createConfigServiceClient,
  type ConfigServiceClient,
} from '@/features/editor/api/config-service-client';
import type { LoadedConfiguration } from '@/features/editor/types/types';

export function configServiceClient(): ConfigServiceClient {
  return createConfigServiceClient({
    baseUrl: env.CONFIG_SERVICE_URL,
    apiKey: env.CONFIG_SERVICE_API_KEY,
  });
}

/** The stored configuration, or null when the id does not exist. */
export async function findConfiguration(
  id: string,
  client: ConfigServiceClient = configServiceClient(),
): Promise<Configuration | null> {
  try {
    return await client.get(id);
  } catch (error) {
    if (error instanceof ConfigServiceError && error.status === 404) return null;
    throw error;
  }
}

/** A missing id opens the default screen, which the first save creates. */
export async function loadConfiguration(
  id: string,
  client: ConfigServiceClient = configServiceClient(),
): Promise<LoadedConfiguration> {
  const configuration = await findConfiguration(id, client);
  if (configuration) return { configuration, isNew: false };
  return {
    configuration: createDefaultConfiguration(id, new Date().toISOString()),
    isNew: true,
  };
}
