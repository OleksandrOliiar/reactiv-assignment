import type { ErrorResponse } from '@reactiv/contracts';
import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'pino';
import { ZodError } from 'zod';

import { AppError } from './app-error';
import { zodErrorDetails } from './zod-details';

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error, req, res, _next) => {
    const requestId =
      'id' in req && (typeof req.id === 'string' || typeof req.id === 'number')
        ? req.id
        : undefined;

    if (error instanceof AppError) {
      res.status(error.status).json(errorBody(error.code, error.message, error.details));
      return;
    }

    if (error instanceof ZodError) {
      res
        .status(400)
        .json(errorBody('VALIDATION_ERROR', 'Invalid request', zodErrorDetails(error)));
      return;
    }

    logger.error({ err: error, requestId }, 'Unhandled error');
    res.status(500).json(errorBody('INTERNAL', 'Internal server error'));
  };
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
