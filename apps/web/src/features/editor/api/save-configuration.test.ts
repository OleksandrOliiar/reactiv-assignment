import { describe, expect, it } from 'vitest';

import { classifySaveFailure, parseSaveInput } from '@/features/editor/api/save-configuration';
import { detailsToFieldErrors } from '@/features/editor/store/utils';
import type { DraftDocument } from '@/features/editor/types/types';

const document: DraftDocument = {
  sections: [
    {
      id: 'cta-1',
      type: 'cta',
      label: 'Go',
      url: 'https://example.com',
      buttonColor: '#111827',
      labelColor: '#FFFFFF',
    },
  ],
};

describe('save configuration results', () => {
  it('maps a service validation path onto the section that owns it', () => {
    expect(
      detailsToFieldErrors(document, [
        {
          path: 'body.data.sections.0.buttonColor',
          message: 'Enter a hex color like #RGB or #RRGGBB',
        },
      ]),
    ).toEqual({
      'cta-1': { buttonColor: 'Enter a hex color like #RGB or #RRGGBB' },
    });
  });

  it('rejects a draft the shared schema does not accept', () => {
    const result = parseSaveInput({
      id: 'default',
      version: 1,
      isNew: false,
      data: {
        sections: [{ ...document.sections[0], buttonColor: 'red' }],
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.result.status).toBe('invalid');
    if (result.result.status !== 'invalid') return;
    expect(result.result.errors['cta-1']?.buttonColor).toMatch(/hex color/i);
  });

  it('accepts a valid draft', () => {
    expect(parseSaveInput({ id: 'default', version: 2, isNew: false, data: document })).toEqual({
      ok: true,
      value: { id: 'default', version: 2, isNew: false, data: document },
    });
  });

  it('reports a bad id or version as a screen error', () => {
    const result = parseSaveInput({ id: 'has spaces', version: 0, isNew: false, data: document });

    expect(result).toMatchObject({
      ok: false,
      result: {
        status: 'invalid',
        errors: { _screen: { id: expect.any(String), version: expect.any(String) } },
      },
    });
  });

  it('maps service validation details onto the draft', () => {
    expect(
      classifySaveFailure(
        {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: [{ path: 'body.data.sections.0.url', message: 'Enter an http or https URL' }],
        },
        document,
      ),
    ).toEqual({
      status: 'invalid',
      message: 'Request validation failed',
      errors: { 'cta-1': { url: 'Enter an http or https URL' } },
    });
  });

  it('turns a version mismatch into a conflict and a missing record into not found', () => {
    expect(
      classifySaveFailure({ code: 'CONFLICT', message: 'Version mismatch' }, document),
    ).toMatchObject({ status: 'conflict' });

    expect(classifySaveFailure({ code: 'NOT_FOUND', message: 'Missing' }, document)).toMatchObject({
      status: 'not_found',
    });

    expect(classifySaveFailure({ code: 'INTERNAL', message: 'Down' }, document)).toBeNull();
  });
});
