import { describe, expect, it } from 'vitest';

import { safeHexColor } from '@/features/sections/values';

describe('draft display values', () => {
  it('keeps six-digit colors and expands three-digit colors', () => {
    expect(safeHexColor('#AbC123')).toBe('#AbC123');
    expect(safeHexColor(' #fff ')).toBe('#ffffff');
  });

  it('drops colors the preview cannot paint', () => {
    expect(safeHexColor('red')).toBeUndefined();
    expect(safeHexColor('#12')).toBeUndefined();
  });
});
