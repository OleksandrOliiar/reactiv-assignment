import type { Configuration } from '@reactiv/contracts';

import type { DraftImage, DraftSection, LoadedConfiguration, SectionType } from '../types/types';

export type FieldErrors = Record<string, Record<string, string>>;

export type DraftDocument = {
  sections: DraftSection[];
};

type EditorState = {
  id: string;
  version: number;
  isNew: boolean;
  document: DraftDocument;
  savedDocument: DraftDocument;
  selectedSectionId: string | null;
  serverErrors: FieldErrors;
};

type EditorAction = {
  addSection: (type: SectionType, index?: number) => void;
  duplicateSection: (id: string) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, direction: 'up' | 'down') => void;
  reorderSection: (id: string, overId: string) => void;
  updateSection: (id: string, update: (section: DraftSection) => DraftSection) => void;
  addImage: (sectionId: string) => void;
  updateImage: (
    sectionId: string,
    imageId: string,
    update: (image: DraftImage) => DraftImage,
  ) => void;
  removeImage: (sectionId: string, imageId: string) => void;
  moveImage: (sectionId: string, imageId: string, direction: 'up' | 'down') => void;
  selectSection: (id: string | null) => void;
  replaceDocument: (document: DraftDocument) => void;
  markSaved: (configuration: Configuration) => void;
  discardChanges: () => void;
  replaceFromServer: (loaded: LoadedConfiguration) => void;
  setServerErrors: (errors: FieldErrors) => void;
  markForCreate: () => void;
};

export type EditorStore = {
  state: EditorState;
  actions: EditorAction;
};
