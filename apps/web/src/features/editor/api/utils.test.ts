import { describe, expect, it } from 'vitest';

import { parseSaveInput } from '@/features/editor/api/utils';
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

describe('parseSaveInput', () => {
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
});
