import { env } from '@/env';
import {
  ConfigServiceError,
  loadConfiguration,
  EditorScreen,
  EditorStoreProvider,
} from '@/features/editor';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const loaded = await loadHomeScreen();
  return (
    <EditorStoreProvider initial={loaded}>
      <EditorScreen />
    </EditorStoreProvider>
  );
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
