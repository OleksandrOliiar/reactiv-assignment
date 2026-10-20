import { env } from '@/env';
import { EditorScreen, EditorStoreProvider, loadConfiguration } from '@/features/editor';

// The screen comes from the API on every request. Without this, `next build` would try to
// prerender the page while the API may not be running.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const loaded = await loadConfiguration(env.DEFAULT_CONFIG_ID);
  return (
    <EditorStoreProvider initial={loaded}>
      <EditorScreen />
    </EditorStoreProvider>
  );
}
