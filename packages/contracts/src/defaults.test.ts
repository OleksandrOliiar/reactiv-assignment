import { describe, expect, it } from 'vitest';

import { configurationSchema } from './configuration';
import { createDefaultConfiguration, defaultConfigurationData } from './defaults';

describe('defaults', () => {
  it('builds a valid stored configuration', () => {
    const configuration = createDefaultConfiguration('default', '2026-01-01T00:00:00.000Z');
    expect(configurationSchema.safeParse(configuration).success).toBe(true);
    expect(configuration.data).toEqual(defaultConfigurationData);
    expect(configuration.version).toBe(1);
    expect(configuration.data.sections.map((section) => section.type)).toEqual([
      'carousel',
      'text',
      'cta',
    ]);
  });
});
