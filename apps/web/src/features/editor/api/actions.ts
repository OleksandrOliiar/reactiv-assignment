'use server';

import { entityIdSchema, type Configuration } from '@reactiv/contracts';

import {
  findConfiguration,
  overwriteDraft,
  saveDraft,
} from '@/features/editor/api/configuration-service';
import { parseSaveInput, type SaveResult } from '@/features/editor/api/utils';

const UNAVAILABLE = 'The configuration service is unavailable.';

export async function saveConfiguration(input: unknown): Promise<SaveResult> {
  const parsed = parseSaveInput(input);
  if (!parsed.ok) return parsed.result;
  return hideFailure(() => saveDraft(parsed.value));
}

export async function overwriteConfiguration(input: unknown): Promise<SaveResult> {
  const parsed = parseSaveInput(input);
  if (!parsed.ok) return parsed.result;
  return hideFailure(() => overwriteDraft(parsed.value));
}

/** The stored configuration, or null when it no longer exists. */
export async function loadLatestConfiguration(id: unknown): Promise<Configuration | null> {
  const parsed = entityIdSchema.safeParse(id);
  if (!parsed.success) throw new Error('The configuration id is invalid.');
  return hideFailure(() => findConfiguration(parsed.data));
}

/** Errors thrown from an action reach the browser, so the cause stays on the server. */
async function hideFailure<T>(task: () => Promise<T>): Promise<T> {
  try {
    return await task();
  } catch {
    throw new Error(UNAVAILABLE);
  }
}
