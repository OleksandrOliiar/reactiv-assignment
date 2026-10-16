import { z } from 'zod';

import { carouselSectionSchema } from './carousel';
import { ctaSectionSchema } from './cta';
import { textSectionSchema } from './text';

export const sectionSchema = z.discriminatedUnion('type', [
  carouselSectionSchema,
  textSectionSchema,
  ctaSectionSchema,
]);

export type Section = z.infer<typeof sectionSchema>;

export {
  ASPECT_RATIOS,
  aspectRatioSchema,
  carouselImageSchema,
  carouselSectionSchema,
} from './carousel';
export type { AspectRatio, CarouselImage, CarouselSection } from './carousel';
export { ctaSectionSchema } from './cta';
export type { CtaSection } from './cta';
export { textSectionSchema } from './text';
export type { TextBlock, TextSection } from './text';
