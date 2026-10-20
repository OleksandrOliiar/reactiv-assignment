import type { ErrorDetail } from '@reactiv/contracts';
import type { Request } from 'express';
import type { z, ZodType } from 'zod';

import { ValidationError } from '../errors/app-error';

type RequestSchemas = {
  params?: ZodType;
  body?: ZodType;
};

type ParsedRequest<S extends RequestSchemas> = {
  [K in keyof S]: S[K] extends ZodType ? z.output<S[K]> : never;
};

/**
 * Parses the request parts that have a schema. Throws a `ValidationError` listing every
 * issue, with paths prefixed by `params` or `body`.
 */
export function parseRequest<S extends RequestSchemas>(req: Request, schemas: S): ParsedRequest<S> {
  const parsed: Record<string, unknown> = {};
  const details: ErrorDetail[] = [];

  for (const part of ['params', 'body'] as const) {
    const schema = schemas[part];
    if (!schema) continue;

    const result = schema.safeParse(req[part]);
    if (result.success) {
      parsed[part] = result.data;
    } else {
      details.push(
        ...result.error.issues.map((issue) => ({
          path: [part, ...issue.path].map(String).join('.'),
          message: issue.message,
        })),
      );
    }
  }

  if (details.length > 0) {
    throw new ValidationError('Invalid request', details);
  }
  return parsed as ParsedRequest<S>;
}
