import {
  configurationDataSchema,
  entityIdSchema,
  type Configuration,
  type ErrorDetail,
} from '@reactiv/contracts';
import { z } from 'zod';

import { detailsToFieldErrors, issuesToFieldErrors } from '@/features/editor/store/utils';
import type { DraftDocument, FieldErrors } from '@/features/editor/types/types';

export type SaveInput = {
  id: string;
  version: number;
  isNew: boolean;
  data: DraftDocument;
};

export type SaveResult =
  | { status: 'saved'; configuration: Configuration }
  | { status: 'invalid'; message: string; errors: FieldErrors }
  | { status: 'conflict'; message: string }
  | { status: 'not_found'; message: string };

const saveInputSchema = z.object({
  id: entityIdSchema,
  version: z.number().int().positive({ error: 'Version must be a positive integer' }),
  isNew: z.boolean(),
  data: configurationDataSchema,
});

export function parseSaveInput(
  input: unknown,
): { ok: true; value: SaveInput } | { ok: false; result: SaveResult } {
  const parsed = saveInputSchema.safeParse(input);
  if (parsed.success) return { ok: true, value: parsed.data };

  return {
    ok: false,
    result: {
      status: 'invalid',
      message: 'The screen is not valid yet.',
      errors: issuesToFieldErrors(draftOf(input), parsed.error.issues),
    },
  };
}

/** Enough of an unparsed draft to map issue paths back to section ids. */
function draftOf(input: unknown): DraftDocument {
  const sections = (input as { data?: { sections?: unknown } } | null)?.data?.sections;
  return { sections: Array.isArray(sections) ? sections : [] };
}

type ServiceFailure = {
  status: number;
  code: string;
  message: string;
  details?: ErrorDetail[];
};

/** Maps an expected API failure onto a result the browser can render. */
export function classifySaveFailure(
  failure: ServiceFailure,
  document: DraftDocument,
): SaveResult | null {
  if (failure.status === 409 || failure.code === 'CONFLICT') {
    return { status: 'conflict', message: failure.message };
  }
  if (failure.status === 404 || failure.code === 'NOT_FOUND') {
    return { status: 'not_found', message: failure.message };
  }
  if (failure.status === 400 || failure.code === 'VALIDATION_ERROR') {
    return {
      status: 'invalid',
      message: failure.message,
      errors: detailsToFieldErrors(document, failure.details ?? []),
    };
  }
  return null;
}
