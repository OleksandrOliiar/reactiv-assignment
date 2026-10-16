import { errorResponseSchema } from '@reactiv/contracts';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createLogger } from '../logger';
import { notFoundHandler } from '../middleware/not-found';
import { validate } from '../middleware/validate';
import { ConflictError } from './app-error';
import { createErrorHandler } from './error-handler';

function createApp() {
  const app = express();
  app.use(express.json());

  app.post(
    '/widgets',
    validate({ body: z.object({ name: z.string().trim().min(1) }) }),
    (req, res) => {
      res.json(req.validated?.body);
    },
  );

  app.get('/conflict', (_req, _res, next) => {
    next(new ConflictError('Version conflict', [{ path: 'version', message: 'Stale version' }]));
  });

  app.get('/boom', () => {
    throw new Error('database password=secret');
  });

  app.use(notFoundHandler);
  app.use(createErrorHandler(createLogger('silent')));
  return app;
}

describe('error handler', () => {
  const app = createApp();

  it('returns validation details and keeps the parsed body', async () => {
    const invalid = await request(app).post('/widgets').send({ name: '' });
    expect(invalid.status).toBe(400);
    expect(errorResponseSchema.parse(invalid.body).error.details).toEqual([
      { path: 'body.name', message: expect.any(String) },
    ]);

    const valid = await request(app).post('/widgets').send({ name: '  Ada  ' });
    expect(valid.status).toBe(200);
    expect(valid.body).toEqual({ name: 'Ada' });
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

  it('returns 400 for malformed JSON', async () => {
    const response = await request(app)
      .post('/widgets')
      .set('Content-Type', 'application/json')
      .send('{');
    expect(response.status).toBe(400);
    expect(errorResponseSchema.parse(response.body).error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Invalid JSON',
    });
  });

  it('hides unexpected errors and unknown routes', async () => {
    const boom = await request(app).get('/boom');
    expect(boom.status).toBe(500);
    expect(JSON.stringify(boom.body)).not.toContain('secret');
    expect(errorResponseSchema.parse(boom.body).error.code).toBe('INTERNAL');

    const missing = await request(app).get('/missing');
    expect(missing.status).toBe(404);
    expect(errorResponseSchema.parse(missing.body).error.code).toBe('NOT_FOUND');
  });
});
