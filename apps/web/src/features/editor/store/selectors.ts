import type { DraftDocument, EditorStore, FieldErrors } from '@/features/editor/store/types';
import { validate } from '@/features/editor/store/utils';

export type { FieldErrors };

export function selectIsDirty(store: EditorStore): boolean {
  return JSON.stringify(store.state.document) !== JSON.stringify(store.state.savedDocument);
}

const validationCache = new WeakMap<DraftDocument, FieldErrors>();

/** Stable per document, which `useSyncExternalStore` needs from selectors. */
export function selectValidation(store: EditorStore): FieldErrors {
  const cached = validationCache.get(store.state.document);
  if (cached) return cached;
  const errors = validate(store.state.document);
  validationCache.set(store.state.document, errors);
  return errors;
}
