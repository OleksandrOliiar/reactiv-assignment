'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';

import type { LoadedConfiguration } from '../types/types';
import {
  selectActions,
  selectHasErrors,
  selectIsDirty,
  selectIsNew,
  selectSections,
  selectSelectedSectionId,
  selectValidation,
  selectVersion,
} from '../store/selectors';
import { createEditorStore, type EditorStoreApi } from '../store/store';
import type { EditorStore } from '../store/types';
import { LIMITS } from '@reactiv/contracts';

const EditorStoreContext = createContext<EditorStoreApi | null>(null);

export function EditorStoreProvider({
  initial,
  children,
}: {
  initial: LoadedConfiguration;
  children: ReactNode;
}) {
  // One store per mount. A module-level store would be shared across requests during SSR.
  const [store] = useState(() => createEditorStore({ initial }));

  return <EditorStoreContext.Provider value={store}>{children}</EditorStoreContext.Provider>;
}

export function useEditorStoreApi(): EditorStoreApi {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error('useEditorStoreApi must be used within EditorStoreProvider');
  return store;
}

function useEditorStore<T>(selector: (store: EditorStore) => T): T {
  return useStore(useEditorStoreApi(), selector);
}

export function useEditorIsDirty() {
  return useEditorStore(selectIsDirty);
}

export function useEditorValidation() {
  return useEditorStore(selectValidation);
}

export function useEditorHasErrors() {
  return useEditorStore(selectHasErrors);
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

export function useSectionsAtLimit() {
  return useEditorSections().length >= LIMITS.sections;
}
