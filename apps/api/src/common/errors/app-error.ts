import type { ErrorCode, ErrorDetail } from '@reactiv/contracts';

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: ErrorDetail[];

  constructor(status: number, code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    if (details && details.length > 0) {
      this.details = details;
    }
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request', details?: ErrorDetail[]) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Invalid API key') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetail[]) {
    super(409, 'CONFLICT', message, details);
  }
}
