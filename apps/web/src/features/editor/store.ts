import { configurationDataSchema, type Configuration } from '@reactiv/contracts';
import { createStore, type StoreApi } from 'zustand/vanilla';

import type { LoadedConfiguration } from '@/features/configuration/types';
import {
  createSection,
  duplicateSection,
  toDraftDocument,
  type DraftDocument,
  type DraftImage,
  type DraftSection,
  type SectionType,
} from '@/features/editor/draft';

export type EditorState = {
  id: string;
  version: number;
  isNew: boolean;
  document: DraftDocument;
  savedDocument: DraftDocument;
  selectedSectionId: string | null;
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
};

type CreateEditorStoreOptions = {
  initial: LoadedConfiguration;
  createId?: () => string;
};

export type EditorStore = StoreApi<EditorState>;

export function createEditorStore({
  initial,
  createId = () => crypto.randomUUID(),
}: CreateEditorStoreOptions): EditorStore {
  const document = toDraftDocument(initial.configuration.data);

  return createStore<EditorState>()((set) => ({
    id: initial.configuration.id,
    version: initial.configuration.version,
    isNew: initial.isNew,
    document,
    savedDocument: structuredClone(document),
    selectedSectionId: document.sections[0]?.id ?? null,
    addSection(type, index) {
      const section = createSection(type, createId);
      set((state) => {
        const sections = state.document.sections.slice();
        const insertAt = index === undefined ? sections.length : clampIndex(index, sections.length);
        sections.splice(insertAt, 0, section);
        return {
          document: { sections },
          selectedSectionId: section.id,
        };
      });
    },
    duplicateSection(id) {
      set((state) => {
        const index = state.document.sections.findIndex((section) => section.id === id);
        const section = state.document.sections[index];
        if (!section) return state;
        const copy = duplicateSection(section, createId);
        const sections = state.document.sections.slice();
        sections.splice(index + 1, 0, copy);
        return { document: { sections }, selectedSectionId: copy.id };
      });
    },
    removeSection(id) {
      set((state) => {
        const sections = state.document.sections.filter((section) => section.id !== id);
        const selectedSectionId =
          state.selectedSectionId === id ? (sections[0]?.id ?? null) : state.selectedSectionId;
        return { document: { sections }, selectedSectionId };
      });
    },
    moveSection(id, direction) {
      set((state) => ({
        document: {
          sections: moveById(state.document.sections, id, direction),
        },
      }));
    },
    reorderSection(id, overId) {
      set((state) => {
        const sections = state.document.sections;
        const from = sections.findIndex((section) => section.id === id);
        const to = sections.findIndex((section) => section.id === overId);
        if (from < 0 || to < 0 || from === to) return state;
        const next = sections.slice();
        const [section] = next.splice(from, 1);
        if (!section) return state;
        next.splice(to, 0, section);
        return { document: { sections: next } };
      });
    },
    updateSection(id, update) {
      set((state) => ({
        document: {
          sections: state.document.sections.map((section) =>
            section.id === id ? update(section) : section,
          ),
        },
      }));
    },
    addImage(sectionId) {
      const image = { id: createId(), url: 'https://example.com/image.jpg' };
      set((state) => ({
        document: {
          sections: mapCarousel(state.document.sections, sectionId, (section) => ({
            ...section,
            images: [...section.images, image],
          })),
        },
      }));
    },
    updateImage(sectionId, imageId, update) {
      set((state) => ({
        document: {
          sections: mapCarousel(state.document.sections, sectionId, (section) => ({
            ...section,
            images: section.images.map((image) => (image.id === imageId ? update(image) : image)),
          })),
        },
      }));
    },
    removeImage(sectionId, imageId) {
      set((state) => ({
        document: {
          sections: mapCarousel(state.document.sections, sectionId, (section) => ({
            ...section,
            images: section.images.filter((image) => image.id !== imageId),
          })),
        },
      }));
    },
    moveImage(sectionId, imageId, direction) {
      set((state) => ({
        document: {
          sections: mapCarousel(state.document.sections, sectionId, (section) => ({
            ...section,
            images: moveById(section.images, imageId, direction),
          })),
        },
      }));
    },
    selectSection(id) {
      set({ selectedSectionId: id });
    },
    replaceDocument(document) {
      const next = structuredClone(document);
      set({
        document: next,
        selectedSectionId: next.sections[0]?.id ?? null,
      });
    },
    markSaved(configuration) {
      const next = toDraftDocument(configuration.data);
      set({
        id: configuration.id,
        version: configuration.version,
        isNew: false,
        document: next,
        savedDocument: structuredClone(next),
      });
    },
    discardChanges() {
      set((state) => ({ document: structuredClone(state.savedDocument) }));
    },
    replaceFromServer(loaded) {
      const next = toDraftDocument(loaded.configuration.data);
      set({
        id: loaded.configuration.id,
        version: loaded.configuration.version,
        isNew: loaded.isNew,
        document: next,
        savedDocument: structuredClone(next),
        selectedSectionId: next.sections[0]?.id ?? null,
      });
    },
  }));
}

export function selectIsDirty(state: EditorState): boolean {
  return JSON.stringify(state.document) !== JSON.stringify(state.savedDocument);
}

export type FieldErrors = Record<string, Record<string, string>>;

const NO_ERRORS: FieldErrors = {};
const validationCache = new WeakMap<DraftDocument, FieldErrors>();

/** Stable per document, which `useSyncExternalStore` needs from selectors. */
export function selectValidation(state: EditorState): FieldErrors {
  const cached = validationCache.get(state.document);
  if (cached) return cached;
  const errors = validate(state.document);
  validationCache.set(state.document, errors);
  return errors;
}

function validate(document: DraftDocument): FieldErrors {
  const parsed = configurationDataSchema.safeParse(document);
  if (parsed.success) return NO_ERRORS;

  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const [head, index, ...rest] = issue.path;
    const section =
      head === 'sections' && typeof index === 'number' ? document.sections[index] : undefined;
    const sectionKey = section?.id ?? '_screen';
    const field = section
      ? rest.map(String).join('.') || 'section'
      : issue.path.map(String).join('.') || 'screen';
    const fields = errors[sectionKey] ?? {};
    if (!fields[field]) fields[field] = issue.message;
    errors[sectionKey] = fields;
  }
  return errors;
}

function clampIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), length);
}

function moveById<T extends { id: string }>(items: T[], id: string, direction: 'up' | 'down'): T[] {
  const from = items.findIndex((item) => item.id === id);
  if (from < 0) return items;
  const to = direction === 'up' ? from - 1 : from + 1;
  if (to < 0 || to >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  if (!item) return items;
  next.splice(to, 0, item);
  return next;
}

function mapCarousel(
  sections: DraftSection[],
  sectionId: string,
  update: (
    section: Extract<DraftSection, { type: 'carousel' }>,
  ) => Extract<DraftSection, { type: 'carousel' }>,
): DraftSection[] {
  return sections.map((section) =>
    section.type === 'carousel' && section.id === sectionId ? update(section) : section,
  );
}
