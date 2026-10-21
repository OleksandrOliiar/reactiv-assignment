import { createDefaultConfiguration, type Configuration } from '@reactiv/contracts';
import 'server-only';

import {
  ConfigServiceError,
  configServiceClient,
  type ConfigServiceClient,
} from '@/features/editor/api/config-service-client';
import type { SaveInput, SaveResult } from '@/features/editor/api/utils';
import { detailsToFieldErrors } from '@/features/editor/store/utils';
import type { DraftDocument, LoadedConfiguration } from '@/features/editor/types/types';

/** The stored configuration, or null when the id does not exist. */
export async function findConfiguration(
  id: string,
  client: ConfigServiceClient = configServiceClient(),
): Promise<Configuration | null> {
  try {
    return await client.get(id);
  } catch (error) {
    if (error instanceof ConfigServiceError && error.status === 404) return null;
    throw error;
  }
}

/** A missing id opens the default screen, which the first save creates. */
export async function loadConfiguration(
  id: string,
  client: ConfigServiceClient = configServiceClient(),
): Promise<LoadedConfiguration> {
  const configuration = await findConfiguration(id, client);
  if (configuration) return { configuration, isNew: false };
  return {
    configuration: createDefaultConfiguration(id, new Date().toISOString()),
    isNew: true,
  };
}

/**
 * Creates a new screen, or updates at the version the draft was based on. Failures the editor
 * can show (conflict, missing, invalid) come back as results. Anything else is rethrown.
 */
export async function saveDraft(
  input: SaveInput,
  client: ConfigServiceClient = configServiceClient(),
): Promise<SaveResult> {
  try {
    const configuration = input.isNew
      ? await client.create({ id: input.id, data: input.data })
      : await client.update(input.id, { version: input.version, data: input.data });
    return { status: 'saved', configuration };
  } catch (error) {
    const result = error instanceof ConfigServiceError ? toSaveResult(error, input.data) : null;
    if (result) return result;
    throw error;
  }
}

/** Maps an API failure the editor can show onto a result. Returns null for any other failure. */
function toSaveResult(failure: ConfigServiceError, document: DraftDocument): SaveResult | null {
  switch (failure.code) {
    case 'CONFLICT':
      return { status: 'conflict', message: failure.message };
    case 'NOT_FOUND':
      return { status: 'not_found', message: failure.message };
    case 'VALIDATION_ERROR':
      return {
        status: 'invalid',
        message: failure.message,
        errors: detailsToFieldErrors(document, failure.details ?? []),
      };
    default:
      return null;
  }
}

/** Saves the draft over whatever version is stored now, or creates it if it was deleted. */
export async function overwriteDraft(
  input: SaveInput,
  client: ConfigServiceClient = configServiceClient(),
): Promise<SaveResult> {
  const latest = await findConfiguration(input.id, client);
  return saveDraft(
    latest ? { ...input, isNew: false, version: latest.version } : { ...input, isNew: true },
    client,
  );
}
