import { z } from 'zod';

import { LIMITS, entityIdSchema, httpUrlSchema } from '../primitives';
import { duplicateIdIndexes } from '../refinements';

export const ASPECT_RATIOS = ['portrait', 'landscape', 'square'] as const;

export const aspectRatioSchema = z.enum(ASPECT_RATIOS, {
  error: 'Aspect ratio must be portrait, landscape, or square',
});

export const carouselImageSchema = z.object({
  id: entityIdSchema,
  url: httpUrlSchema,
});

export const carouselSectionSchema = z.object({
  id: entityIdSchema,
  type: z.literal('carousel'),
  aspectRatio: aspectRatioSchema,
  images: z
    .array(carouselImageSchema)
    .max(LIMITS.imagesPerCarousel, {
      error: `A carousel can have at most ${LIMITS.imagesPerCarousel} images`,
    })
    .superRefine((images, ctx) => {
      for (const index of duplicateIdIndexes(images.map((image) => image.id))) {
        ctx.addIssue({
          code: 'custom',
          message: 'Image ids must be unique',
          path: [index, 'id'],
          input: images[index]?.id,
        });
      }
    }),
});

export type AspectRatio = z.infer<typeof aspectRatioSchema>;
export type CarouselImage = z.infer<typeof carouselImageSchema>;
export type CarouselSection = z.infer<typeof carouselSectionSchema>;
