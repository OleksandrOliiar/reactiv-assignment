import { describe, expect, it } from 'vitest';

import { LIMITS } from '../primitives';
import { carouselSectionSchema } from './carousel';
import { ctaSectionSchema } from './cta';
import { sectionSchema } from './index';
import { textSectionSchema } from './text';

const carousel = {
  id: 'carousel-1',
  type: 'carousel' as const,
  aspectRatio: 'square' as const,
  images: [{ id: 'image-1', url: 'https://example.com/a.jpg' }],
};

describe('section schemas', () => {
  it('accepts each section variant', () => {
    expect(carouselSectionSchema.safeParse(carousel).success).toBe(true);
    expect(
      textSectionSchema.safeParse({
        id: 'text-1',
        type: 'text',
        title: { text: 'Hello', color: '#111' },
        description: { text: 'World', color: '#222222' },
      }).success,
    ).toBe(true);
    expect(
      ctaSectionSchema.safeParse({
        id: 'cta-1',
        type: 'cta',
        label: 'Go',
        url: 'https://example.com',
        buttonColor: '#000',
        labelColor: '#fff',
      }).success,
    ).toBe(true);
  });

  it('rejects an unknown section type', () => {
    const result = sectionSchema.safeParse({ ...carousel, type: 'video' });
    expect(result.success).toBe(false);
  });

  it('rejects a javascript CTA url and an invalid button color', () => {
    const result = ctaSectionSchema.safeParse({
      id: 'cta-1',
      type: 'cta',
      label: 'Go',
      url: 'javascript:alert(1)',
      buttonColor: 'red',
      labelColor: '#fff',
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate image ids and too many images', () => {
    const duplicate = carouselSectionSchema.safeParse({
      ...carousel,
      images: [
        { id: 'same', url: 'https://example.com/a.jpg' },
        { id: 'same', url: 'https://example.com/b.jpg' },
      ],
    });
    expect(duplicate.success).toBe(false);

    const tooMany = carouselSectionSchema.safeParse({
      ...carousel,
      images: Array.from({ length: LIMITS.imagesPerCarousel + 1 }, (_, index) => ({
        id: `image-${index}`,
        url: 'https://example.com/a.jpg',
      })),
    });
    expect(tooMany.success).toBe(false);
  });

  it('allows a carousel with no images', () => {
    expect(carouselSectionSchema.safeParse({ ...carousel, images: [] }).success).toBe(true);
  });

  it('rejects an unknown aspect ratio', () => {
    expect(carouselSectionSchema.safeParse({ ...carousel, aspectRatio: 'wide' }).success).toBe(
      false,
    );
  });
});
