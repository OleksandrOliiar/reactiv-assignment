import { z } from 'zod';

import { LIMITS, entityIdSchema, hexColorSchema } from '../primitives';

const textBlockSchema = (maxLength: number, label: string) =>
  z.object({
    text: z
      .string()
      .trim()
      .min(1, { error: `${label} is required` })
      .max(maxLength, { error: `${label} must be at most ${maxLength} characters` }),
    color: hexColorSchema,
  });

export const textSectionSchema = z.object({
  id: entityIdSchema,
  type: z.literal('text'),
  title: textBlockSchema(LIMITS.title, 'Title'),
  description: textBlockSchema(LIMITS.description, 'Description'),
});

export type TextBlock = z.infer<ReturnType<typeof textBlockSchema>>;
export type TextSection = z.infer<typeof textSectionSchema>;
