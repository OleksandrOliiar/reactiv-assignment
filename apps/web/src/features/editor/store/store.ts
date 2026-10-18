import { current } from 'immer';
import { createStore, type StateCreator } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';

import type { LoadedConfiguration } from '@/features/editor/types/types';
import type { EditorStore } from '@/features/editor/store/types';
import {
  clampIndex,
  createSection,
  duplicateSection,
  findCarousel,
  moveById,
} from '@/features/editor/store/utils';

type CreateEditorStoreOptions = {
  initial: LoadedConfiguration;
  createId?: () => string;
};

export function createEditorStore({
  initial,
  createId = () => crypto.randomUUID(),
}: CreateEditorStoreOptions) {
  const document = structuredClone(initial.configuration.data);

  return createStore<EditorStore>()(
    immer((set) => ({
      state: {
        id: initial.configuration.id,
        version: initial.configuration.version,
        isNew: initial.isNew,
        document,
        savedDocument: structuredClone(document),
        selectedSectionId: document.sections[0]?.id ?? null,
      },
      actions: {
        addSection(type, index) {
          const section = createSection(type, createId);
          set((store) => {
            const sections = store.state.document.sections;
            const insertAt =
              index === undefined ? sections.length : clampIndex(index, sections.length);
            sections.splice(insertAt, 0, section);
            store.state.selectedSectionId = section.id;
          });
        },
        duplicateSection(id) {
          set((store) => {
            const sections = store.state.document.sections;
            const index = sections.findIndex((section) => section.id === id);
            const section = sections[index];
            if (!section) return;
            const copy = duplicateSection(current(section), createId);
            sections.splice(index + 1, 0, copy);
            store.state.selectedSectionId = copy.id;
          });
        },
        removeSection(id) {
          set((store) => {
            const sections = store.state.document.sections;
            const index = sections.findIndex((section) => section.id === id);
            if (index < 0) return;
            sections.splice(index, 1);
            if (store.state.selectedSectionId === id) {
              store.state.selectedSectionId = sections[0]?.id ?? null;
            }
          });
        },
        moveSection(id, direction) {
          set((store) => {
            store.state.document.sections = moveById(store.state.document.sections, id, direction);
          });
        },
        reorderSection(id, overId) {
          set((store) => {
            const sections = store.state.document.sections;
            const from = sections.findIndex((section) => section.id === id);
            const to = sections.findIndex((section) => section.id === overId);
            if (from < 0 || to < 0 || from === to) return;
            const [section] = sections.splice(from, 1);
            if (section) sections.splice(to, 0, section);
          });
        },
        updateSection(id, update) {
          set((store) => {
            const sections = store.state.document.sections;
            const index = sections.findIndex((section) => section.id === id);
            const section = sections[index];
            if (!section) return;
            sections[index] = update(current(section));
          });
        },
        addImage(sectionId) {
          const image = { id: createId(), url: 'https://example.com/image.jpg' };
          set((store) => {
            const section = findCarousel(store, sectionId);
            section?.images.push(image);
          });
        },
        updateImage(sectionId, imageId, update) {
          set((store) => {
            const section = findCarousel(store, sectionId);
            if (!section) return;
            const index = section.images.findIndex((image) => image.id === imageId);
            const image = section.images[index];
            if (!image) return;
            section.images[index] = update(current(image));
          });
        },
        removeImage(sectionId, imageId) {
          set((store) => {
            const section = findCarousel(store, sectionId);
            if (!section) return;
            const index = section.images.findIndex((image) => image.id === imageId);
            if (index >= 0) section.images.splice(index, 1);
          });
        },
        moveImage(sectionId, imageId, direction) {
          set((store) => {
            const section = findCarousel(store, sectionId);
            if (!section) return;
            section.images = moveById(section.images, imageId, direction);
          });
        },
        selectSection(id) {
          set((store) => {
            store.state.selectedSectionId = id;
          });
        },
        replaceDocument(document) {
          const next = structuredClone(document);
          set((store) => {
            store.state.document = next;
            store.state.selectedSectionId = next.sections[0]?.id ?? null;
          });
        },
        markSaved(configuration) {
          const next = structuredClone(configuration.data);
          set((store) => {
            store.state.id = configuration.id;
            store.state.version = configuration.version;
            store.state.isNew = false;
            store.state.document = next;
            store.state.savedDocument = structuredClone(next);
          });
        },
        discardChanges() {
          set((store) => {
            store.state.document = current(store.state.savedDocument);
          });
        },
        replaceFromServer(loaded) {
          const next = structuredClone(loaded.configuration.data);
          set((store) => {
            store.state.id = loaded.configuration.id;
            store.state.version = loaded.configuration.version;
            store.state.isNew = loaded.isNew;
            store.state.document = next;
            store.state.savedDocument = structuredClone(next);
            store.state.selectedSectionId = next.sections[0]?.id ?? null;
          });
        },
      },
    })) as StateCreator<EditorStore>,
  );
}

export type EditorStoreApi = ReturnType<typeof createEditorStore>;