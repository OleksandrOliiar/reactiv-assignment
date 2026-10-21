import { CURRENT_SCHEMA_VERSION } from './configuration';

/**
 * Upgrades a payload from `version` to `version + 1`, keyed by the version being upgraded from.
 * Empty until the payload shape changes. To ship version 2, add a `1:` step and bump
 * `CURRENT_SCHEMA_VERSION`.
 */
const migrations: Record<number, (data: unknown) => unknown> = {};

export class UnsupportedSchemaVersionError extends Error {
  constructor(fromVersion: number) {
    super(
      `Unsupported schema version ${String(fromVersion)}. This app supports versions 1 through ${String(CURRENT_SCHEMA_VERSION)}.`,
    );
    this.name = 'UnsupportedSchemaVersionError';
  }
}

/** Upgrade `data` from `fromVersion` to `CURRENT_SCHEMA_VERSION`. Validate the result afterwards. */
export function migrateConfigurationData(data: unknown, fromVersion: number): unknown {
  if (!Number.isInteger(fromVersion) || fromVersion < 1 || fromVersion > CURRENT_SCHEMA_VERSION) {
    throw new UnsupportedSchemaVersionError(fromVersion);
  }

  let current = data;
  for (let version = fromVersion; version < CURRENT_SCHEMA_VERSION; version += 1) {
    const step = migrations[version];
    if (!step) throw new UnsupportedSchemaVersionError(fromVersion);
    current = step(current);
  }
  return current;
}
