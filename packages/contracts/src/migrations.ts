import { CURRENT_SCHEMA_VERSION } from './configuration';

/**
 * Upgrades a payload from `version` to `version + 1`.
 * Keys are the version being upgraded from. There is no step for the current
 * version until a newer one exists.
 */
export type MigrationStep = (data: unknown) => unknown;

export const configurationMigrations: Record<number, MigrationStep> = {};

export class UnsupportedSchemaVersionError extends Error {
  readonly fromVersion: number;

  constructor(fromVersion: number) {
    super(
      `Unsupported schema version ${String(fromVersion)}. This app supports versions 1 through ${String(CURRENT_SCHEMA_VERSION)}.`,
    );
    this.name = 'UnsupportedSchemaVersionError';
    this.fromVersion = fromVersion;
  }
}

export function runMigrations(
  data: unknown,
  fromVersion: number,
  targetVersion: number,
  steps: Record<number, MigrationStep>,
): unknown {
  if (!Number.isInteger(fromVersion) || fromVersion < 1 || fromVersion > targetVersion) {
    throw new UnsupportedSchemaVersionError(fromVersion);
  }

  let current = data;

  for (let version = fromVersion; version < targetVersion; version += 1) {
    const step = steps[version];
    if (!step) {
      throw new UnsupportedSchemaVersionError(fromVersion);
    }
    current = step(current);
  }

  return current;
}

/** Upgrade `data` from `fromVersion` to `CURRENT_SCHEMA_VERSION`. */
export function migrateConfigurationData(data: unknown, fromVersion: number): unknown {
  return runMigrations(data, fromVersion, CURRENT_SCHEMA_VERSION, configurationMigrations);
}
