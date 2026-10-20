import { configurationDataSchema, defaultConfigurationData } from '@reactiv/contracts';
import { describe, expect, it } from 'vitest';

import { createSection, detailsToFieldErrors, moveById, validate } from './utils';

describe('createSection', () => {
  it('creates a valid starting section of each type', () => {
    const sections = (['carousel', 'text', 'cta'] as const).map((type) =>
      createSection(type, () => `${type}-1`),
    );

    expect(sections.map((section) => section.type)).toEqual(['carousel', 'text', 'cta']);
    expect(configurationDataSchema.safeParse({ sections }).success).toBe(true);
  });
});

describe('moveById', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('swaps an item with its neighbour without changing the input', () => {
    expect(moveById(items, 'b', 'up').map((item) => item.id)).toEqual(['b', 'a', 'c']);
    expect(moveById(items, 'b', 'down').map((item) => item.id)).toEqual(['a', 'c', 'b']);
    expect(items.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('returns the same array at either end or for an unknown id', () => {
    expect(moveById(items, 'a', 'up')).toBe(items);
    expect(moveById(items, 'c', 'down')).toBe(items);
    expect(moveById(items, 'x', 'up')).toBe(items);
  });
});

describe('detailsToFieldErrors', () => {
  const document = defaultConfigurationData;

  it('keys section errors by section id and screen errors by `_screen`', () => {
    expect(
      detailsToFieldErrors(document, [
        { path: 'data.sections.1.title.color', message: 'Bad color' },
        { path: 'data.sections.0', message: 'Bad section' },
        { path: 'data.sections', message: 'Too many sections' },
        { path: '', message: 'Bad body' },
      ]),
    ).toEqual({
      'welcome-text': { 'title.color': 'Bad color' },
      'welcome-carousel': { section: 'Bad section' },
      _screen: { 'data.sections': 'Too many sections', screen: 'Bad body' },
    });
  });

  it('keeps the first message for a field', () => {
    expect(
      detailsToFieldErrors(document, [
        { path: 'sections.2.url', message: 'First' },
        { path: 'sections.2.url', message: 'Second' },
      ]),
    ).toEqual({ 'welcome-cta': { url: 'First' } });
  });

  it('falls back to `_screen` for an index past the end of the draft', () => {
    expect(detailsToFieldErrors(document, [{ path: 'sections.9.url', message: 'Bad' }])).toEqual({
      _screen: { 'sections.9.url': 'Bad' },
    });
  });
});

describe('validate', () => {
  it('returns no errors for a valid draft and per-field errors otherwise', () => {
    expect(validate(defaultConfigurationData)).toEqual({});

    const [carousel] = defaultConfigurationData.sections;
    if (carousel?.type !== 'carousel') throw new Error('expected the carousel first');
    const broken = {
      sections: [{ ...carousel, images: [{ id: 'image-1', url: 'ftp://example.com/a.jpg' }] }],
    };
    expect(validate(broken)).toEqual({
      'welcome-carousel': { 'images.0.url': 'Enter an http or https URL' },
    });
  });
});
