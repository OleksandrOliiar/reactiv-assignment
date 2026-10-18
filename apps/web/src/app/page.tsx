import { HomeScreenSummary } from '@/features/configuration/home-screen-summary';
import { env } from '@/env';
import { ConfigServiceError } from '@/features/configuration/api/config-service-client';
import { loadConfiguration } from '@/features/configuration/api/load-configuration';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const loaded = await loadHomeScreen();
  return <HomeScreenSummary loaded={loaded} />;
}

async function loadHomeScreen() {
  try {
    return await loadConfiguration(env.DEFAULT_CONFIG_ID);
  } catch (error) {
    if (error instanceof ConfigServiceError) {
      throw new Error('The configuration service is unavailable.');
    }
    throw error;
  }
}
