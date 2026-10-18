import { describe, expect, it } from 'vitest';

import { classifySaveFailure, parseSaveInput } from '@/features/editor/api/save-configuration';
import { serverDetailsToFieldErrors } from '@/features/editor/store/utils';
import type { DraftDocument } from '@/features/editor/store/types';

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
      serverDetailsToFieldErrors(document, [
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
    const result = parseSaveInput(
      {
        id: 'default',
        version: 1,
        isNew: false,
        data: {
          sections: [{ ...document.sections[0], buttonColor: 'red' }],
        },
      },
      document,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.result.status).toBe('invalid');
    if (result.result.status !== 'invalid') return;
    expect(result.result.errors['cta-1']?.buttonColor).toMatch(/hex color/i);
  });

  it('turns a version mismatch into a conflict and a missing record into not found', () => {
    expect(
      classifySaveFailure({ status: 409, code: 'CONFLICT', message: 'Version mismatch' }, document),
    ).toMatchObject({ status: 'conflict' });

    expect(
      classifySaveFailure({ status: 404, code: 'NOT_FOUND', message: 'Missing' }, document),
    ).toMatchObject({ status: 'not_found' });

    expect(
      classifySaveFailure({ status: 503, code: 'INTERNAL', message: 'Down' }, document),
    ).toBeNull();
  });
});
