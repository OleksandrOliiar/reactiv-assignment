import type { ErrorDetail } from '@reactiv/contracts';
import type { ZodError } from 'zod';

export function zodErrorDetails(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message,
  }));
}
