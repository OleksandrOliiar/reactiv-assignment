import type { DraftDocument, EditorStore, FieldErrors } from '@/features/editor/store/types';
import { validate } from '@/features/editor/store/utils';

export type { FieldErrors };

export function selectIsDirty(store: EditorStore) {
  return JSON.stringify(store.state.document) !== JSON.stringify(store.state.savedDocument);
}

const validationCache = new WeakMap<DraftDocument, FieldErrors>();
const mergedValidationCache = new WeakMap<
  DraftDocument,
  { server: FieldErrors; result: FieldErrors }
>();

/** Stable per document, which `useSyncExternalStore` needs from selectors. */
export function selectValidation(store: EditorStore) {
  const documentErrors = documentValidation(store.state.document);
  const serverErrors = store.state.serverErrors;
  if (Object.keys(serverErrors).length === 0) return documentErrors;

  const cached = mergedValidationCache.get(store.state.document);
  if (cached?.server === serverErrors) return cached.result;

  const result: FieldErrors = { ...documentErrors };
  for (const [sectionId, fields] of Object.entries(serverErrors)) {
    result[sectionId] = { ...fields, ...result[sectionId] };
  }
  mergedValidationCache.set(store.state.document, { server: serverErrors, result });
  return result;
}

function documentValidation(document: DraftDocument): FieldErrors {
  const cached = validationCache.get(document);
  if (cached) return cached;
  const errors = validate(document);
  validationCache.set(document, errors);
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
