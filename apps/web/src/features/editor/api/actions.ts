'use server';

import { entityIdSchema } from '@reactiv/contracts';

import { env } from '@/env';
import {
  ConfigServiceError,
  createConfigServiceClient,
  type ConfigServiceClient,
} from '@/features/editor/api/config-service-client';
import {
  classifySaveFailure,
  parseSaveInput,
  type LoadLatestResult,
  type SaveResult,
} from '@/features/editor/api/save-configuration';
import type { DraftDocument } from '@/features/editor/store/types';

export async function saveConfiguration(input: unknown): Promise<SaveResult> {
  const document = draftOf(input);
  const parsed = parseSaveInput(input, document);
  if (!parsed.ok) return parsed.result;

  const client = defaultClient();
  try {
    const configuration = parsed.value.isNew
      ? await client.create({ id: parsed.value.id, data: parsed.value.data })
      : await client.update(parsed.value.id, {
          version: parsed.value.version,
          data: parsed.value.data,
        });
    return { status: 'saved', configuration };
  } catch (error) {
    return failureResult(error, document);
  }
}

export async function loadLatestConfiguration(id: unknown): Promise<LoadLatestResult> {
  const parsed = entityIdSchema.safeParse(id);
  if (!parsed.success) throw new Error('The configuration id is invalid.');

  try {
    return { status: 'loaded', configuration: await defaultClient().get(parsed.data) };
  } catch (error) {
    if (error instanceof ConfigServiceError && error.status === 404) return { status: 'missing' };
    throw new Error('The configuration service is unavailable.');
  }
}

function failureResult(error: unknown, document: DraftDocument): SaveResult {
  if (error instanceof ConfigServiceError) {
    const classified = classifySaveFailure(error, document);
    if (classified) return classified;
  }
  throw new Error('The configuration service is unavailable.');
}

function draftOf(input: unknown): DraftDocument {
  if (typeof input === 'object' && input !== null && 'data' in input) {
    const data = input.data;
    if (
      typeof data === 'object' &&
      data !== null &&
      'sections' in data &&
      Array.isArray(data.sections)
    ) {
      return { sections: data.sections };
    }
  }
  return { sections: [] };
}

function defaultClient(): ConfigServiceClient {
  return createConfigServiceClient({
    baseUrl: env.CONFIG_SERVICE_URL,
    apiKey: env.CONFIG_SERVICE_API_KEY,
  });
}
