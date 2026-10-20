import type { Configuration } from '@reactiv/contracts';

import type {
  DraftDocument,
  DraftImage,
  DraftSection,
  FieldErrors,
  SectionType,
} from '../types/types';

export type EditorState = {
  id: string;
  version: number;
  isNew: boolean;
  document: DraftDocument;
  savedDocument: DraftDocument;
  selectedSectionId: string | null;
  serverErrors: FieldErrors;
};

type EditorActions = {
  addSection: (type: SectionType) => void;
  duplicateSection: (id: string) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, direction: 'up' | 'down') => void;
  reorderSection: (id: string, overId: string) => void;
  /** Shallow merge: nested values such as a text block must be passed whole. */
  updateSection: <T extends DraftSection>(
    section: T,
    patch: Partial<Omit<T, 'id' | 'type'>>,
  ) => void;
  addImage: (sectionId: string) => void;
  updateImage: (sectionId: string, imageId: string, patch: Partial<Omit<DraftImage, 'id'>>) => void;
  removeImage: (sectionId: string, imageId: string) => void;
  moveImage: (sectionId: string, imageId: string, direction: 'up' | 'down') => void;
  selectSection: (id: string | null) => void;
  replaceDocument: (document: DraftDocument) => void;
  markSaved: (configuration: Configuration) => void;
  discardChanges: () => void;
  setServerErrors: (errors: FieldErrors) => void;
  markForCreate: () => void;
};

export type EditorStore = {
  state: EditorState;
  actions: EditorActions;
};
