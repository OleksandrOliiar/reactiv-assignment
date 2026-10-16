import { describe, expect, it } from 'vitest';

import { errorResponseSchema } from './errors';

describe('errorResponseSchema', () => {
  it('accepts an error with field details', () => {
    const result = errorResponseSchema.safeParse({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid configuration',
        details: [{ path: 'data.sections.0.images.0.url', message: 'Enter an http or https URL' }],
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown error code', () => {
    const result = errorResponseSchema.safeParse({
      error: { code: 'TEAPOT', message: 'No' },
    });
    expect(result.success).toBe(false);
  });
});
