import { describe, expect, it } from 'vitest';

import { CURRENT_SCHEMA_VERSION } from './configuration';
import {
  UnsupportedSchemaVersionError,
  migrateConfigurationData,
  runMigrations,
} from './migrations';

describe('migrateConfigurationData', () => {
  it('returns the current payload unchanged', () => {
    const data = { sections: [] };
    expect(migrateConfigurationData(data, CURRENT_SCHEMA_VERSION)).toBe(data);
  });

  it('rejects versions newer than the app or below 1', () => {
    expect(() => migrateConfigurationData({}, CURRENT_SCHEMA_VERSION + 1)).toThrow(
      UnsupportedSchemaVersionError,
    );
    expect(() => migrateConfigurationData({}, 0)).toThrow(UnsupportedSchemaVersionError);
  });
});

describe('runMigrations', () => {
  it('applies each step from the source version up to the target', () => {
    const result = runMigrations({ sections: [] }, 1, 3, {
      1: (data) => ({ ...(data as object), v: 2 }),
      2: (data) => ({ ...(data as object), v: 3 }),
    });

    expect(result).toEqual({ sections: [], v: 3 });
  });

  it('throws when a step in the range is missing', () => {
    expect(() => runMigrations({}, 1, 3, { 1: (data) => data })).toThrow(
      UnsupportedSchemaVersionError,
    );
  });
});
