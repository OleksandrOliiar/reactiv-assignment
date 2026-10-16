import { timingSafeEqual } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../errors/app-error';

export function createApiKeyAuth(apiKey: string) {
  const expected = Buffer.from(apiKey);

  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.header('x-api-key');
    if (!header || !sameSecret(header, expected)) {
      next(new UnauthorizedError());
      return;
    }
    next();
  };
}

function sameSecret(provided: string, expected: Buffer): boolean {
  const actual = Buffer.from(provided);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
