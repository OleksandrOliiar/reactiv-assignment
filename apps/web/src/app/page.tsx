import { env } from '@/env';
import { EditorScreen, EditorStoreProvider, loadConfiguration } from '@/features/editor';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const loaded = await loadConfiguration(env.DEFAULT_CONFIG_ID);
  return (
    <EditorStoreProvider initial={loaded}>
      <EditorScreen />
    </EditorStoreProvider>
  );
}
