import { defaultConfigurationData, type Configuration } from '@reactiv/contracts';
import { describe, expect, it } from 'vitest';

import type { LoadedConfiguration } from '../types/types';
import { createEditorStore } from './store';
import { selectIsDirty, selectValidation } from './selectors';

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
    const textId = defaultConfigurationData.sections[1]?.id;
    expect(textId).toBeTruthy();
    editor.getState().actions.updateSection(textId ?? '', (section) => {
      if (section.type !== 'text') return section;
      return { ...section, title: { ...section.title, text: 'Hello' } };
    });
    expect(selectIsDirty(editor.getState())).toBe(true);

    editor.getState().actions.discardChanges();
    expect(selectIsDirty(editor.getState())).toBe(false);
    expect(editor.getState().state.document.sections[1]).toEqual(
      defaultConfigurationData.sections[1],
    );
  });

  it('adds, duplicates, reorders, and removes sections', () => {
    const editor = store();
    editor.getState().actions.addSection('text', 0);
    expect(editor.getState().state.document.sections[0]?.id).toBe('id-1');
    expect(editor.getState().state.selectedSectionId).toBe('id-1');

    editor.getState().actions.duplicateSection('id-1');
    expect(editor.getState().state.document.sections[1]?.id).toBe('id-2');

    editor.getState().actions.moveSection('id-2', 'up');
    expect(editor.getState().state.document.sections[0]?.id).toBe('id-2');

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
    const textId =
      defaultConfigurationData.sections.find((section) => section.type === 'text')?.id ?? '';
    editor.getState().actions.updateSection(textId, (section) => {
      if (section.type !== 'text') return section;
      return { ...section, title: { ...section.title, color: 'red' } };
    });

    expect(selectValidation(editor.getState())[textId]?.['title.color']).toMatch(/hex color/i);
    expect(selectValidation(editor.getState())).toBe(selectValidation(editor.getState()));
    expect(selectIsDirty(editor.getState())).toBe(true);
  });

  it('shows server field errors until the draft changes', () => {
    const editor = store();
    const textId =
      defaultConfigurationData.sections.find((section) => section.type === 'text')?.id ?? '';
    editor.getState().actions.setServerErrors({
      [textId]: { 'title.color': 'Rejected by the configuration service' },
    });

    expect(selectValidation(editor.getState())[textId]?.['title.color']).toMatch(
      /configuration service/,
    );
    expect(selectValidation(editor.getState())).toBe(selectValidation(editor.getState()));

    editor.getState().actions.updateSection(textId, (section) => {
      if (section.type !== 'text') return section;
      return { ...section, title: { ...section.title, text: 'Hello' } };
    });
    expect(selectValidation(editor.getState())[textId]?.['title.color']).toBeUndefined();
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
});
