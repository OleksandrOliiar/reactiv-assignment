import { current } from 'immer';
import { createStore, type StateCreator } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';

import type {
  DraftDocument,
  FieldErrors,
  LoadedConfiguration,
} from '@/features/editor/types/types';
import type { EditorState, EditorStore } from '@/features/editor/store/types';
import {
  createSection,
  duplicateSection,
  findCarousel,
  moveById,
} from '@/features/editor/store/utils';

const NO_ERRORS: FieldErrors = {};

function firstSectionId(document: DraftDocument): string | null {
  return document.sections[0]?.id ?? null;
}

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
    immer((set, get) => {
      /** Server errors describe the draft that was sent, so any draft change drops them. */
      function edit(recipe: (state: EditorState) => void) {
        set((store) => {
          store.state.serverErrors = NO_ERRORS;
          recipe(store.state);
        });
      }

      return {
        state: {
          id: initial.configuration.id,
          version: initial.configuration.version,
          isNew: initial.isNew,
          document,
          savedDocument: document,
          selectedSectionId: firstSectionId(document),
          serverErrors: NO_ERRORS,
        },
        actions: {
          addSection(type) {
            const section = createSection(type, createId);
            edit((state) => {
              state.document.sections.push(section);
              state.selectedSectionId = section.id;
            });
          },
          duplicateSection(id) {
            edit((state) => {
              const sections = state.document.sections;
              const index = sections.findIndex((section) => section.id === id);
              const section = sections[index];
              if (!section) return;
              const copy = duplicateSection(current(section), createId);
              sections.splice(index + 1, 0, copy);
              state.selectedSectionId = copy.id;
            });
          },
          removeSection(id) {
            edit((state) => {
              const sections = state.document.sections;
              const index = sections.findIndex((section) => section.id === id);
              if (index < 0) return;
              sections.splice(index, 1);
              if (state.selectedSectionId === id) {
                state.selectedSectionId = firstSectionId(state.document);
              }
            });
          },
          moveSection(id, direction) {
            edit((state) => {
              state.document.sections = moveById(state.document.sections, id, direction);
            });
          },
          reorderSection(id, overId) {
            edit((state) => {
              const sections = state.document.sections;
              const from = sections.findIndex((section) => section.id === id);
              const to = sections.findIndex((section) => section.id === overId);
              if (from < 0 || to < 0 || from === to) return;
              const [section] = sections.splice(from, 1);
              if (section) sections.splice(to, 0, section);
            });
          },
          updateSection(section, patch) {
            edit((state) => {
              const target = state.document.sections.find(({ id }) => id === section.id);
              if (target) Object.assign(target, patch);
            });
          },
          addImage(sectionId) {
            // A valid placeholder so adding an image never makes the draft unsaveable.
            const image = { id: createId(), url: 'https://example.com/image.jpg' };
            edit((state) => {
              findCarousel(state, sectionId)?.images.push(image);
            });
          },
          updateImage(sectionId, imageId, patch) {
            edit((state) => {
              const image = findCarousel(state, sectionId)?.images.find(({ id }) => id === imageId);
              if (image) Object.assign(image, patch);
            });
          },
          removeImage(sectionId, imageId) {
            edit((state) => {
              const images = findCarousel(state, sectionId)?.images;
              const index = images?.findIndex(({ id }) => id === imageId) ?? -1;
              if (index >= 0) images?.splice(index, 1);
            });
          },
          moveImage(sectionId, imageId, direction) {
            edit((state) => {
              const section = findCarousel(state, sectionId);
              if (section) section.images = moveById(section.images, imageId, direction);
            });
          },
          selectSection(id) {
            set((store) => {
              store.state.selectedSectionId = id;
            });
          },
          replaceDocument(document) {
            edit((state) => {
              state.document = document;
              state.selectedSectionId = firstSectionId(document);
            });
          },
          markSaved(configuration) {
            const document = configuration.data;
            edit((state) => {
              state.id = configuration.id;
              state.version = configuration.version;
              state.isNew = false;
              state.document = document;
              state.savedDocument = document;
            });
          },
          discardChanges() {
            const { savedDocument } = get().state;
            edit((state) => {
              state.document = savedDocument;
            });
          },
          setServerErrors(errors) {
            set((store) => {
              store.state.serverErrors = errors;
            });
          },
          markForCreate() {
            set((store) => {
              store.state.isNew = true;
            });
          },
        },
      };
    }) as StateCreator<EditorStore>,
  );
}

export type EditorStoreApi = ReturnType<typeof createEditorStore>;
