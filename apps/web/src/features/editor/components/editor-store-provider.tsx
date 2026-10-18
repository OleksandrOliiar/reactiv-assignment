'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';

import type { LoadedConfiguration } from '../types/types';
import {
  selectActions,
  selectIsDirty,
  selectSelectedSectionId,
  selectValidation,
  selectVersion,
  selectIsNew,
  selectSections,
} from '../store/selectors';
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

export function useEditorStoreApi(): EditorStoreApi {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error('useEditorStore must be used within EditorStoreProvider');
  return store;
}

export function useEditorStore<T>(selector: (store: EditorStore) => T): T {
  return useStore(useEditorStoreApi(), selector);
}

export function useEditorIsDirty() {
  return useEditorStore(selectIsDirty);
}

export function useEditorValidation() {
  return useEditorStore(selectValidation);
}

export function useEditorActions() {
  return useEditorStore(selectActions);
}

export function useEditorVersion() {
  return useEditorStore(selectVersion);
}

export function useEditorIsNew() {
  return useEditorStore(selectIsNew);
}

export function useEditorSelectedSectionId() {
  return useEditorStore(selectSelectedSectionId);
}

export function useEditorSections() {
  return useEditorStore(selectSections);
}
