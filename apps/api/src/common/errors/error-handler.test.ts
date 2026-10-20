import { errorResponseSchema } from '@reactiv/contracts';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseRequest } from '../http/parse-request';
import { createLogger } from '../logger';
import { notFoundHandler } from '../middleware/not-found';
import { ConflictError } from './app-error';
import { createErrorHandler } from './error-handler';

function createApp() {
  const app = express();
  app.use(express.json({ limit: '1kb' }));

  app.post('/widgets/:id', (req, res) => {
    const { params, body } = parseRequest(req, {
      params: z.object({ id: z.string().regex(/^w-/) }),
      body: z.object({ name: z.string().trim().min(1) }),
    });
    res.json({ id: params.id, ...body });
  });

  app.get('/conflict', (_req, _res, next) => {
    next(new ConflictError('Version conflict', [{ path: 'version', message: 'Stale version' }]));
  });

  app.get('/boom', () => {
    throw new Error('database password=secret');
  });

  app.get('/corrupt', () => {
    z.object({ sections: z.array(z.unknown()) }).parse({ sections: 'not stored as an array' });
  });

  app.use(notFoundHandler);
  app.use(createErrorHandler(createLogger('silent')));
  return app;
}

describe('error handler', () => {
  const app = createApp();

  it('returns prefixed validation details and passes on the parsed request', async () => {
    const invalid = await request(app).post('/widgets/x').send({ name: '' });
    expect(invalid.status).toBe(400);
    expect(errorResponseSchema.parse(invalid.body).error.details).toEqual([
      { path: 'params.id', message: expect.any(String) },
      { path: 'body.name', message: expect.any(String) },
    ]);

    const valid = await request(app).post('/widgets/w-1').send({ name: '  Ada  ' });
    expect(valid.status).toBe(200);
    expect(valid.body).toEqual({ id: 'w-1', name: 'Ada' });
  });

  it('returns the conflict body', async () => {
    const response = await request(app).get('/conflict');
    expect(response.status).toBe(409);
    expect(errorResponseSchema.parse(response.body)).toEqual({
      error: {
        code: 'CONFLICT',
        message: 'Version conflict',
        details: [{ path: 'version', message: 'Stale version' }],
      },
    });
  });

  it('returns 400 for malformed JSON and 413 for an oversized body', async () => {
    const malformed = await request(app)
      .post('/widgets/w-1')
      .set('Content-Type', 'application/json')
      .send('{');
    expect(malformed.status).toBe(400);
    expect(errorResponseSchema.parse(malformed.body).error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Invalid JSON',
    });

    const oversized = await request(app)
      .post('/widgets/w-1')
      .send({ name: 'x'.repeat(2_000) });
    expect(oversized.status).toBe(413);
    expect(errorResponseSchema.parse(oversized.body).error.message).toBe(
      'Request body is too large',
    );
  });

  it('hides unexpected errors, including bad stored data, and unknown routes', async () => {
    const boom = await request(app).get('/boom');
    expect(boom.status).toBe(500);
    expect(JSON.stringify(boom.body)).not.toContain('secret');
    expect(errorResponseSchema.parse(boom.body).error.code).toBe('INTERNAL');

    const corrupt = await request(app).get('/corrupt');
    expect(corrupt.status).toBe(500);
    expect(errorResponseSchema.parse(corrupt.body).error.code).toBe('INTERNAL');

    const missing = await request(app).get('/missing');
    expect(missing.status).toBe(404);
    expect(errorResponseSchema.parse(missing.body).error.code).toBe('NOT_FOUND');
  });
});
