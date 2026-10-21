import { describe, expect, it } from 'vitest';

import { CURRENT_SCHEMA_VERSION } from './configuration';
import { UnsupportedSchemaVersionError, migrateConfigurationData } from './migrations';

describe('migrateConfigurationData', () => {
  it('returns the current payload unchanged', () => {
    const data = { sections: [] };
    expect(migrateConfigurationData(data, CURRENT_SCHEMA_VERSION)).toBe(data);
  });

  it('rejects versions newer than the app, below 1, or not whole numbers', () => {
    for (const version of [CURRENT_SCHEMA_VERSION + 1, 0, 1.5]) {
      expect(() => migrateConfigurationData({}, version)).toThrow(UnsupportedSchemaVersionError);
    }
  });
});
