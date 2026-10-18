import type { DraftDocument, EditorStore, FieldErrors } from '@/features/editor/store/types';
import { validate } from '@/features/editor/store/utils';

export type { FieldErrors };

export function selectIsDirty(store: EditorStore) {
  return JSON.stringify(store.state.document) !== JSON.stringify(store.state.savedDocument);
}

const validationCache = new WeakMap<DraftDocument, FieldErrors>();

/** Stable per document, which `useSyncExternalStore` needs from selectors. */
export function selectValidation(store: EditorStore) {
  const cached = validationCache.get(store.state.document);
  if (cached) return cached;
  const errors = validate(store.state.document);
  validationCache.set(store.state.document, errors);
  return errors;
}

export function selectActions(store: EditorStore) {
  return store.actions;
}

export function selectVersion(store: EditorStore) {
  return store.state.version;
}

export function selectIsNew(store: EditorStore) {
  return store.state.isNew;
}

export function selectSelectedSectionId(store: EditorStore) {
  return store.state.selectedSectionId;
}

export function selectSections(store: EditorStore) {
  return store.state.document.sections;
}