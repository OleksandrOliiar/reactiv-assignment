'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';

import type { LoadedConfiguration } from '../types/types';
import { selectIsDirty, selectValidation } from '../store/selectors';
import { createEditorStore, type EditorStoreApi } from '../store/store';
import type { EditorStore } from '../store/types';

const EditorStoreContext = createContext<EditorStoreApi | null>(null);

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

export function useEditorStore<T>(selector: (store: EditorStore) => T): T {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error('useEditorStore must be used within EditorStoreProvider');
  return useStore(store, selector);
}

export function useIsDirty() {
  return useEditorStore(selectIsDirty);
}

export function useValidation() {
  return useEditorStore(selectValidation);
}
