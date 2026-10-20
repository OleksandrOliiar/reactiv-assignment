import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

import { EditorStoreProvider } from '@/features/editor/components/editor-store-provider';
import type { LoadedConfiguration } from '@/features/editor/types/types';
import { TooltipProvider } from '@/shared/ui/tooltip';

export function renderEditor(
  ui: ReactElement,
  {
    initial,
    ...options
  }: Omit<RenderOptions, 'wrapper'> & {
    initial: LoadedConfiguration;
  },
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <TooltipProvider>
        <EditorStoreProvider initial={initial}>{children}</EditorStoreProvider>
      </TooltipProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
