import { z } from 'zod';

import { LIMITS, entityIdSchema, isoDateTimeSchema } from './primitives';
import { duplicateIdIndexes } from './refinements';
import { sectionSchema } from './sections';

/** Shape version of `data`. Bump this when the payload shape changes. */
export const CURRENT_SCHEMA_VERSION = 1 as const;

export const configurationDataSchema = z.object({
  sections: z
    .array(sectionSchema)
    .max(LIMITS.sections, {
      error: `A screen can have at most ${LIMITS.sections} sections`,
    })
    .superRefine((sections, ctx) => {
      for (const index of duplicateIdIndexes(sections.map((section) => section.id))) {
        ctx.addIssue({
          code: 'custom',
          message: 'Section ids must be unique',
          path: [index, 'id'],
          input: sections[index]?.id,
        });
      }
    }),
});

/**
 * `version` counts edits and starts at 1. It is independent of `schemaVersion`.
 */
export const configurationSchema = z.object({
  id: entityIdSchema,
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  version: z.number().int().positive({ error: 'Version must be a positive integer' }),
  updatedAt: isoDateTimeSchema,
  data: configurationDataSchema,
});

export const createConfigurationRequestSchema = z.object({
  id: entityIdSchema.optional(),
  data: configurationDataSchema,
});

export const updateConfigurationRequestSchema = z.object({
  version: z.number().int().positive({ error: 'Version must be a positive integer' }),
  data: configurationDataSchema,
});

/** File produced by export. Always the current schema version. */
export const exportFileSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  exportedAt: isoDateTimeSchema,
  data: configurationDataSchema,
});

/**
 * Loose envelope for an imported file. `data` is validated only after
 * `migrateConfigurationData` upgrades it to `CURRENT_SCHEMA_VERSION`.
 */
export const importFileEnvelopeSchema = z.object({
  schemaVersion: z.number().int().positive({ error: 'schemaVersion must be a positive integer' }),
  exportedAt: isoDateTimeSchema,
  data: z.unknown(),
});

export type ConfigurationData = z.infer<typeof configurationDataSchema>;
export type Configuration = z.infer<typeof configurationSchema>;
export type CreateConfigurationRequest = z.infer<typeof createConfigurationRequestSchema>;
export type UpdateConfigurationRequest = z.infer<typeof updateConfigurationRequestSchema>;
export type ExportFile = z.infer<typeof exportFileSchema>;
export type ImportFileEnvelope = z.infer<typeof importFileEnvelopeSchema>;
