import { describe, expect, it } from 'vitest';

import {
  configurationSchema,
  createConfigurationRequestSchema,
  exportFileSchema,
  importFileEnvelopeSchema,
  updateConfigurationRequestSchema,
} from './configuration';
import { defaultConfigurationData } from './defaults';

const stored = {
  id: 'default',
  schemaVersion: 1 as const,
  version: 1,
  updatedAt: '2026-01-01T00:00:00.000Z',
  data: defaultConfigurationData,
};

describe('configuration schemas', () => {
  it('accepts a stored configuration and an export file', () => {
    expect(configurationSchema.safeParse(stored).success).toBe(true);
    expect(
      exportFileSchema.safeParse({
        schemaVersion: 1,
        exportedAt: stored.updatedAt,
        data: defaultConfigurationData,
      }).success,
    ).toBe(true);
  });

  it('rejects a stale schemaVersion on a stored configuration', () => {
    expect(configurationSchema.safeParse({ ...stored, schemaVersion: 2 }).success).toBe(false);
  });

  it('rejects a non-positive edit version', () => {
    expect(
      updateConfigurationRequestSchema.safeParse({ version: 0, data: stored.data }).success,
    ).toBe(false);
  });

  it('allows create requests to omit the id', () => {
    expect(createConfigurationRequestSchema.safeParse({ data: stored.data }).success).toBe(true);
  });

  it('rejects duplicate section ids', () => {
    const [first] = defaultConfigurationData.sections;
    const result = configurationSchema.safeParse({
      ...stored,
      data: { sections: [first, first] },
    });
    expect(result.success).toBe(false);
  });

  it('accepts an import envelope without validating the payload shape', () => {
    const result = importFileEnvelopeSchema.safeParse({
      schemaVersion: 1,
      exportedAt: stored.updatedAt,
      data: { not: 'validated yet' },
    });
    expect(result.success).toBe(true);
  });
});
