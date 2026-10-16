import { z } from 'zod';

export const LIMITS = {
  id: 64,
  title: 120,
  description: 2_000,
  buttonLabel: 80,
  url: 2_048,
  imagesPerCarousel: 10,
  sections: 20,
} as const;

export const entityIdSchema = z
  .string()
  .trim()
  .min(1, { error: 'Id is required' })
  .max(LIMITS.id, { error: `Id must be at most ${LIMITS.id} characters` })
  .regex(/^[A-Za-z0-9_-]+$/, {
    error: 'Id can only contain letters, numbers, underscores, and hyphens',
  });

export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    error: 'Enter a hex color like #RGB or #RRGGBB',
  });

/**
 * http and https only. `z.httpUrl()` also requires a public domain, which would
 * reject localhost and IP addresses used in development.
 */
export const httpUrlSchema = z
  .string()
  .trim()
  .max(LIMITS.url, { error: `URL must be at most ${LIMITS.url} characters` })
  .pipe(
    z.url({
      protocol: /^https?$/,
      error: 'Enter an http or https URL',
    }),
  );

export const isoDateTimeSchema = z.iso.datetime({
  offset: true,
  error: 'Must be an ISO 8601 datetime',
});

export type EntityId = z.infer<typeof entityIdSchema>;
export type HexColor = z.infer<typeof hexColorSchema>;
export type HttpUrl = z.infer<typeof httpUrlSchema>;
