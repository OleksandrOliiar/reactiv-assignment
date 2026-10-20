import { CURRENT_SCHEMA_VERSION, defaultConfigurationData } from '@reactiv/contracts';
import { describe, expect, it } from 'vitest';

import { MAX_IMPORT_BYTES, createExportFile, parseImportText, readImportFile } from './utils';

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
      ok: true,
      data: defaultConfigurationData,
    });
  });

  it('reports malformed JSON', () => {
    expect(parseImportText('{')).toMatchObject({
      ok: false,
      error: { title: 'Could not read this file' },
    });
  });

  it('reports a schema version this app cannot upgrade', () => {
    expect(parseImportText(file({ sections: [] }, CURRENT_SCHEMA_VERSION + 1))).toMatchObject({
      ok: false,
      error: { title: 'Unsupported file version' },
    });
  });

  it('reports a file that is JSON but not a home screen', () => {
    expect(parseImportText('[]')).toEqual({
      ok: false,
      error: {
        title: 'This file is not a valid home screen',
        message: 'This file does not match a home screen export.',
      },
    });
    expect(parseImportText(file({ sections: [{ type: 'text' }] }))).toMatchObject({
      ok: false,
      error: { message: expect.stringContaining('sections.0') },
    });
  });
});

describe('readImportFile', () => {
  it('parses the file contents', async () => {
    const text = JSON.stringify(createExportFile(defaultConfigurationData, exportedAt));
    await expect(readImportFile(new File([text], 'screen.json'))).resolves.toMatchObject({
      ok: true,
    });
  });

  it('rejects a file over the size limit before reading it', async () => {
    const big = new File([new Uint8Array(MAX_IMPORT_BYTES + 1)], 'big.json');
    await expect(readImportFile(big)).resolves.toMatchObject({
      ok: false,
      error: { title: 'This file is too large' },
    });
  });
});
