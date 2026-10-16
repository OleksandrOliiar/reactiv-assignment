import { z } from 'zod';

import { LIMITS, entityIdSchema, hexColorSchema, httpUrlSchema } from '../primitives';

export const ctaSectionSchema = z.object({
  id: entityIdSchema,
  type: z.literal('cta'),
  label: z
    .string()
    .trim()
    .min(1, { error: 'Button label is required' })
    .max(LIMITS.buttonLabel, {
      error: `Button label must be at most ${LIMITS.buttonLabel} characters`,
    }),
  url: httpUrlSchema,
  buttonColor: hexColorSchema,
  labelColor: hexColorSchema,
});

export type CtaSection = z.infer<typeof ctaSectionSchema>;
