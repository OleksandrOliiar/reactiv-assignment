import { describe, expect, it } from 'vitest';

import { entityIdSchema, hexColorSchema, httpUrlSchema, isoDateTimeSchema } from './primitives';

describe('hexColorSchema', () => {
  it.each(['#fff', '#FFF', '#112233', '#AbCdEf'])('accepts %s', (value) => {
    expect(hexColorSchema.safeParse(value).success).toBe(true);
  });

  it.each(['fff', '#ffff', '#ggg', '#12345', 'rgb(0,0,0)', ''])('rejects %s', (value) => {
    const result = hexColorSchema.safeParse(value);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Enter a hex color like #RGB or #RRGGBB');
    }
  });
});

describe('httpUrlSchema', () => {
  it.each([
    'https://example.com',
    'http://example.com/path?q=1#section',
    'https://localhost:3000/editor',
    'http://127.0.0.1/image.png',
    '  https://example.com/trimmed  ',
  ])('accepts %s', (value) => {
    expect(httpUrlSchema.safeParse(value).success).toBe(true);
  });

  it.each(['javascript:alert(1)', 'ftp://example.com', 'data:text/html,hi', 'example.com', ''])(
    'rejects %s',
    (value) => {
      const result = httpUrlSchema.safeParse(value);
      expect(result.success).toBe(false);
    },
  );

  it('trims surrounding whitespace', () => {
    const result = httpUrlSchema.safeParse('  https://example.com/a  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('https://example.com/a');
    }
  });
});

describe('entityIdSchema', () => {
  it('accepts the seeded default id', () => {
    expect(entityIdSchema.parse('default')).toBe('default');
  });

  it('rejects spaces and empty ids', () => {
    expect(entityIdSchema.safeParse('has space').success).toBe(false);
    expect(entityIdSchema.safeParse('').success).toBe(false);
  });
});

describe('isoDateTimeSchema', () => {
  it('accepts toISOString output and numeric offsets', () => {
    expect(isoDateTimeSchema.safeParse(new Date().toISOString()).success).toBe(true);
    expect(isoDateTimeSchema.safeParse('2026-01-01T00:00:00+02:00').success).toBe(true);
  });

  it('rejects a date without a time', () => {
    expect(isoDateTimeSchema.safeParse('2026-01-01').success).toBe(false);
  });
});
