'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';

import type { LoadedConfiguration } from '@/features/configuration/types';
import {
  createEditorStore,
  selectIsDirty,
  selectValidation,
  type EditorState,
  type EditorStore,
  type FieldErrors,
} from '@/features/editor/store';

const EditorStoreContext = createContext<EditorStore | null>(null);

export function EditorStoreProvider({
  initial,
  children,
}: {
  initial: LoadedConfiguration;
  children: ReactNode;
}) {
  const [store] = useState(() => createEditorStore({ initial }));

  return <EditorStoreContext.Provider value={store}>{children}</EditorStoreContext.Provider>;
}

export function useEditorStore<T>(selector: (state: EditorState) => T): T {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error('useEditorStore must be used within EditorStoreProvider');
  return useStore(store, selector);
}

export function useIsDirty(): boolean {
  return useEditorStore(selectIsDirty);
}

export function useValidation(): FieldErrors {
  return useEditorStore(selectValidation);
}
