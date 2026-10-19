import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

import { EditorStoreProvider } from '@/features/editor/components/editor-store-provider';
import type { LoadedConfiguration } from '@/features/editor/types/types';
import { TooltipProvider } from '@/shared/ui/tooltip';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function renderEditor(
  ui: ReactElement,
  {
    initial,
    ...options
  }: Omit<RenderOptions, 'wrapper'> & {
    initial: LoadedConfiguration;
  },
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <EditorStoreProvider initial={initial}>{children}</EditorStoreProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}
