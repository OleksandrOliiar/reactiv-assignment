import type { ErrorResponse } from '@reactiv/contracts';
import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'pino';

import { AppError } from './app-error';

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error, req, res, _next) => {
    if (error instanceof AppError) {
      res.status(error.status).json(errorBody(error.code, error.message, error.details));
      return;
    }

    const bodyError = bodyParserError(error);
    if (bodyError) {
      res.status(bodyError.status).json(errorBody('VALIDATION_ERROR', bodyError.message));
      return;
    }

    logger.error({ err: error, requestId: req.id }, 'Unhandled error');
    res.status(500).json(errorBody('INTERNAL', 'Internal server error'));
  };
}

/** Errors that `express.json()` raises before a route runs. */
function bodyParserError(error: unknown): { status: number; message: string } | null {
  const type = typeof error === 'object' && error !== null && 'type' in error ? error.type : null;
  if (type === 'entity.parse.failed') return { status: 400, message: 'Invalid JSON' };
  if (type === 'entity.too.large') return { status: 413, message: 'Request body is too large' };
  return null;
}

function errorBody(
  code: ErrorResponse['error']['code'],
  message: string,
  details?: ErrorResponse['error']['details'],
): ErrorResponse {
  const body: ErrorResponse = { error: { code, message } };
  if (details && details.length > 0) {
    body.error.details = details;
  }
  return body;
}
