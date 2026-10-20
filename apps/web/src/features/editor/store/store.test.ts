import { defaultConfigurationData, type Configuration } from '@reactiv/contracts';
import { describe, expect, it } from 'vitest';

import type { LoadedConfiguration, SectionOf } from '../types/types';
import { createEditorStore } from './store';
import { selectHasErrors, selectIsDirty, selectValidation } from './selectors';

function textSection(): SectionOf<'text'> {
  const text = defaultConfigurationData.sections.find(
    (section): section is SectionOf<'text'> => section.type === 'text',
  );
  if (!text) throw new Error('The default screen has no text section');
  return text;
}

const configuration: Configuration = {
  id: 'default',
  schemaVersion: 1,
  version: 3,
  updatedAt: '2026-01-01T00:00:00.000Z',
  data: defaultConfigurationData,
};

const loaded: LoadedConfiguration = { configuration, isNew: false };

function store() {
  let next = 0;
  return createEditorStore({
    initial: loaded,
    createId: () => `id-${++next}`,
  });
}

describe('editor store', () => {
  it('starts clean with the loaded document selected', () => {
    const editor = store();
    expect(editor.getState().state.id).toBe('default');
    expect(editor.getState().state.version).toBe(3);
    expect(editor.getState().state.selectedSectionId).toBe(
      defaultConfigurationData.sections[0]?.id,
    );
    expect(selectIsDirty(editor.getState())).toBe(false);
    expect(selectValidation(editor.getState())).toEqual({});
  });

  it('tracks edits and restores them on discard', () => {
    const editor = store();
    const text = textSection();
    editor.getState().actions.updateSection(text, { title: { ...text.title, text: 'Hello' } });
    expect(selectIsDirty(editor.getState())).toBe(true);

    editor.getState().actions.discardChanges();
    expect(selectIsDirty(editor.getState())).toBe(false);
    expect(editor.getState().state.document.sections[1]).toEqual(
      defaultConfigurationData.sections[1],
    );
  });

  it('adds, duplicates, reorders, and removes sections', () => {
    const editor = store();
    editor.getState().actions.addSection('text');
    expect(editor.getState().state.document.sections.at(-1)?.id).toBe('id-1');
    expect(editor.getState().state.selectedSectionId).toBe('id-1');

    editor.getState().actions.duplicateSection('id-1');
    expect(editor.getState().state.document.sections.at(-1)?.id).toBe('id-2');

    editor.getState().actions.moveSection('id-2', 'up');
    expect(editor.getState().state.document.sections.at(-2)?.id).toBe('id-2');

    editor.getState().actions.removeSection('id-2');
    expect(editor.getState().state.document.sections.some((section) => section.id === 'id-2')).toBe(
      false,
    );
  });

  it('moves a dragged section to the position of the section it was dropped on', () => {
    const editor = store();
    const [first, , last] = defaultConfigurationData.sections;
    editor.getState().actions.reorderSection(first?.id ?? '', last?.id ?? '');
    expect(editor.getState().state.document.sections.map((section) => section.id)).toEqual([
      defaultConfigurationData.sections[1]?.id,
      last?.id,
      first?.id,
    ]);
  });

  it('maps invalid draft values to the section that owns them', () => {
    const editor = store();
    const text = textSection();
    editor.getState().actions.updateSection(text, { title: { ...text.title, color: 'red' } });

    expect(selectValidation(editor.getState())[text.id]?.['title.color']).toMatch(/hex color/i);
    expect(selectValidation(editor.getState())).toBe(selectValidation(editor.getState()));
    expect(selectIsDirty(editor.getState())).toBe(true);
  });

  it('shows server field errors until the draft changes', () => {
    const editor = store();
    const text = textSection();
    editor.getState().actions.setServerErrors({
      [text.id]: { 'title.color': 'Rejected by the configuration service' },
    });

    expect(selectValidation(editor.getState())[text.id]?.['title.color']).toMatch(
      /configuration service/,
    );
    expect(selectValidation(editor.getState())).toBe(selectValidation(editor.getState()));

    editor.getState().actions.updateSection(text, { title: { ...text.title, text: 'Hello' } });
    expect(selectValidation(editor.getState())[text.id]?.['title.color']).toBeUndefined();
  });

  it('marks a save as the new clean snapshot', () => {
    const editor = store();
    editor.getState().actions.addSection('cta');
    editor.getState().actions.markSaved({
      ...configuration,
      version: 4,
      data: editor.getState().state.document,
    });

    expect(editor.getState().state.isNew).toBe(false);
    expect(editor.getState().state.version).toBe(4);
    expect(selectIsDirty(editor.getState())).toBe(false);
  });

  it('keeps the open section across a save, or opens the first one if it is gone', () => {
    const editor = store();
    editor.getState().actions.selectSection('welcome-cta');
    editor.getState().actions.markSaved({ ...configuration, version: 4 });
    expect(editor.getState().state.selectedSectionId).toBe('welcome-cta');

    editor.getState().actions.markSaved({
      ...configuration,
      version: 5,
      data: { sections: defaultConfigurationData.sections.slice(0, 2) },
    });
    expect(editor.getState().state.selectedSectionId).toBe('welcome-carousel');
  });

  it('is not dirty when an edit is typed back to the saved value', () => {
    const editor = store();
    const text = textSection();
    editor.getState().actions.updateSection(text, { title: { ...text.title, text: 'Hello' } });
    editor.getState().actions.updateSection(text, { title: text.title });

    expect(selectIsDirty(editor.getState())).toBe(false);
  });

  it('gives a duplicated carousel fresh image ids', () => {
    const editor = store();
    editor.getState().actions.duplicateSection('welcome-carousel');

    const copy = editor.getState().state.document.sections[1];
    expect(copy).toMatchObject({ id: 'id-1', type: 'carousel' });
    if (copy?.type !== 'carousel') return;
    expect(copy.images.map((image) => image.id)).toEqual(['id-2', 'id-3']);
    expect(selectValidation(editor.getState())).toEqual({});
  });

  it('opens the first remaining section when the open one is removed', () => {
    const editor = store();
    editor.getState().actions.selectSection('welcome-text');
    editor.getState().actions.removeSection('welcome-text');
    expect(editor.getState().state.selectedSectionId).toBe('welcome-carousel');

    editor.getState().actions.selectSection('welcome-cta');
    editor.getState().actions.removeSection('welcome-carousel');
    expect(editor.getState().state.selectedSectionId).toBe('welcome-cta');
  });

  it('adds, edits, moves, and removes carousel images', () => {
    const editor = store();
    const { addImage, updateImage, moveImage, removeImage } = editor.getState().actions;
    const images = () => {
      const carousel = editor.getState().state.document.sections[0];
      return carousel?.type === 'carousel' ? carousel.images : [];
    };

    addImage('welcome-carousel');
    expect(images().map((image) => image.id)).toEqual([
      'welcome-carousel-1',
      'welcome-carousel-2',
      'id-1',
    ]);

    updateImage('welcome-carousel', 'id-1', { url: 'https://example.com/new.jpg' });
    expect(images()[2]?.url).toBe('https://example.com/new.jpg');

    moveImage('welcome-carousel', 'id-1', 'up');
    expect(images()[1]?.id).toBe('id-1');

    removeImage('welcome-carousel', 'welcome-carousel-1');
    expect(images().map((image) => image.id)).toEqual(['id-1', 'welcome-carousel-2']);
  });

  it('ignores image actions aimed at a section that is not a carousel', () => {
    const editor = store();
    const before = editor.getState().state.document;
    editor.getState().actions.addImage('welcome-text');

    expect(editor.getState().state.document).toEqual(before);
  });

  it('replaces the draft with an imported document', () => {
    const editor = store();
    const imported = { sections: defaultConfigurationData.sections.slice(2) };
    editor.getState().actions.replaceDocument(imported);

    expect(editor.getState().state.document).toEqual(imported);
    expect(editor.getState().state.selectedSectionId).toBe('welcome-cta');
    expect(selectIsDirty(editor.getState())).toBe(true);
  });

  it('drops server errors on discard and marks a missing screen for creation', () => {
    const editor = store();
    const text = textSection();
    editor.getState().actions.updateSection(text, { title: { ...text.title, text: 'Hello' } });
    editor.getState().actions.setServerErrors({ [text.id]: { 'title.text': 'Rejected' } });
    editor.getState().actions.discardChanges();
    editor.getState().actions.markForCreate();

    expect(selectHasErrors(editor.getState())).toBe(false);
    expect(editor.getState().state.isNew).toBe(true);
  });
});
