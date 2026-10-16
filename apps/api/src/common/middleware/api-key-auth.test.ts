import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { UnauthorizedError } from '../errors/app-error';
import { createApiKeyAuth } from './api-key-auth';

const apiKey = 'change-me-to-a-long-random-secret';

function run(header: string | undefined) {
  const next = vi.fn();
  const req = { header: () => header } as unknown as Request;
  createApiKeyAuth(apiKey)(req, {} as Response, next as NextFunction);
  return next;
}

describe('createApiKeyAuth', () => {
  it('accepts the configured key', () => {
    const next = run(apiKey);
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a missing key, a wrong key, and a different length', () => {
    for (const header of [undefined, 'change-me-to-a-long-random-secreX', 'short']) {
      const next = run(header);
      expect(next).toHaveBeenCalledOnce();
      expect(next.mock.calls[0]?.[0]).toBeInstanceOf(UnauthorizedError);
    }
  });
});
