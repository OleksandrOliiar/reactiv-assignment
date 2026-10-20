'use server';

import { entityIdSchema, type Configuration } from '@reactiv/contracts';

import { ConfigServiceError } from '@/features/editor/api/config-service-client';
import { configServiceClient, findConfiguration } from '@/features/editor/api/load-configuration';
import {
  classifySaveFailure,
  parseSaveInput,
  type SaveInput,
  type SaveResult,
} from '@/features/editor/api/save-configuration';

const UNAVAILABLE = 'The configuration service is unavailable.';

export async function saveConfiguration(input: unknown): Promise<SaveResult> {
  const parsed = parseSaveInput(input);
  if (!parsed.ok) return parsed.result;
  return persist(parsed.value);
}

/** Saves the draft over whatever version is stored now, or creates it if it was deleted. */
export async function overwriteConfiguration(input: unknown): Promise<SaveResult> {
  const parsed = parseSaveInput(input);
  if (!parsed.ok) return parsed.result;

  const latest = await loadLatestConfiguration(parsed.value.id);
  return persist(
    latest
      ? { ...parsed.value, isNew: false, version: latest.version }
      : { ...parsed.value, isNew: true },
  );
}

/** The stored configuration, or null when it no longer exists. */
export async function loadLatestConfiguration(id: unknown): Promise<Configuration | null> {
  const parsed = entityIdSchema.safeParse(id);
  if (!parsed.success) throw new Error('The configuration id is invalid.');

  try {
    return await findConfiguration(parsed.data);
  } catch {
    throw new Error(UNAVAILABLE);
  }
}

async function persist(value: SaveInput): Promise<SaveResult> {
  const client = configServiceClient();
  try {
    const configuration = value.isNew
      ? await client.create({ id: value.id, data: value.data })
      : await client.update(value.id, { version: value.version, data: value.data });
    return { status: 'saved', configuration };
  } catch (error) {
    const result =
      error instanceof ConfigServiceError ? classifySaveFailure(error, value.data) : null;
    if (result) return result;
    throw new Error(UNAVAILABLE);
  }
}
