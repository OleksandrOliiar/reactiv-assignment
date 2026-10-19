import { CURRENT_SCHEMA_VERSION, defaultConfigurationData } from '@reactiv/contracts';
import { describe, expect, it } from 'vitest';

import { MAX_IMPORT_BYTES, createExportFile, isImportTooLarge, parseImportText } from './utils';

const exportedAt = '2026-01-01T00:00:00.000Z';

function file(data: unknown, schemaVersion: number = CURRENT_SCHEMA_VERSION) {
  return JSON.stringify({ schemaVersion, exportedAt, data });
}

describe('createExportFile', () => {
  it('writes the current schema around a valid screen', () => {
    expect(createExportFile(defaultConfigurationData, exportedAt)).toEqual({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt,
      data: defaultConfigurationData,
    });
  });

  it('refuses a screen that fails validation', () => {
    const document = structuredClone(defaultConfigurationData);
    const text = document.sections[1];
    if (text?.type !== 'text') throw new Error('expected the text section');
    text.title.color = 'red';

    expect(createExportFile(document, exportedAt)).toBeNull();
  });
});

describe('parseImportText', () => {
  it('returns the screen from a current export', () => {
    const exported = createExportFile(defaultConfigurationData, exportedAt);
    expect(parseImportText(JSON.stringify(exported))).toEqual({
      status: 'imported',
      data: defaultConfigurationData,
    });
  });

  it('reports malformed JSON', () => {
    expect(parseImportText('{')).toMatchObject({ status: 'invalid_json' });
  });

  it('reports a schema version this app cannot upgrade', () => {
    const result = parseImportText(file({ sections: [] }, CURRENT_SCHEMA_VERSION + 1));
    expect(result.status).toBe('unsupported_version');
  });

  it('reports a file that is JSON but not a home screen', () => {
    expect(parseImportText('[]')).toEqual({
      status: 'invalid_shape',
      message: 'This file does not match a home screen export.',
    });
    const shape = parseImportText(file({ sections: [{ type: 'text' }] }));
    expect(shape.status).toBe('invalid_shape');
    if (shape.status === 'invalid_shape') expect(shape.message).toContain('sections.0');
  });
});

describe('importTooLarge', () => {
  it('accepts a file at the limit and rejects anything larger', () => {
    expect(isImportTooLarge(MAX_IMPORT_BYTES)).toBeNull();
    expect(isImportTooLarge(MAX_IMPORT_BYTES + 1)).toMatchObject({ status: 'too_large' });
  });
});
