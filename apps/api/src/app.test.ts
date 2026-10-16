import { errorResponseSchema, defaultConfigurationData } from '@reactiv/contracts';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createLogger } from './common/logger';
import { MemoryConfigurationsRepository } from './modules/configurations/configurations.repository.memory';
import { createApp } from './app';

const apiKey = 'change-me-to-a-long-random-secret';

function createTestApp() {
  return createApp({
    configurationsRepository: new MemoryConfigurationsRepository(),
    apiKey,
    logger: createLogger('silent'),
  });
}

describe('configuration API', () => {
  const app = createTestApp();

  it('serves health and the OpenAPI document without an API key', async () => {
    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ status: 'ok' });

    const spec = await request(app).get('/openapi.json');
    expect(spec.status).toBe(200);
    expect(spec.body.paths).toHaveProperty('/v1/configurations/{id}');
  });

  it('requires the API key', async () => {
    const response = await request(app).get('/v1/configurations/default');
    expect(response.status).toBe(401);
    expect(errorResponseSchema.parse(response.body).error.code).toBe('UNAUTHORIZED');
  });

  it('creates, loads, and updates a configuration', async () => {
    const created = await request(app)
      .post('/v1/configurations')
      .set('x-api-key', apiKey)
      .send({ id: 'screen-1', data: defaultConfigurationData });

    expect(created.status).toBe(201);
    expect(created.headers.location).toBe('/v1/configurations/screen-1');
    expect(created.body).toMatchObject({ id: 'screen-1', version: 1, schemaVersion: 1 });

    const loaded = await request(app).get('/v1/configurations/screen-1').set('x-api-key', apiKey);
    expect(loaded.status).toBe(200);
    expect(loaded.body.data).toEqual(defaultConfigurationData);

    const text = defaultConfigurationData.sections[1];
    const updated = await request(app)
      .put('/v1/configurations/screen-1')
      .set('x-api-key', apiKey)
      .send({ version: 1, data: { sections: text ? [text] : [] } });
    expect(updated.status).toBe(200);
    expect(updated.body.version).toBe(2);

    const conflict = await request(app)
      .put('/v1/configurations/screen-1')
      .set('x-api-key', apiKey)
      .send({ version: 1, data: defaultConfigurationData });
    expect(conflict.status).toBe(409);
    expect(errorResponseSchema.parse(conflict.body).error.details?.[0]?.message).toBe(
      'Current version is 2',
    );
  });

  it('reports validation errors, duplicates, and missing configurations', async () => {
    const invalid = await request(app)
      .post('/v1/configurations')
      .set('x-api-key', apiKey)
      .send({
        data: {
          sections: [
            {
              id: 'cta-1',
              type: 'cta',
              label: 'Go',
              url: 'javascript:alert(1)',
              buttonColor: '#fff',
              labelColor: '#000',
            },
          ],
        },
      });
    expect(invalid.status).toBe(400);
    expect(errorResponseSchema.parse(invalid.body).error.code).toBe('VALIDATION_ERROR');

    await request(app)
      .post('/v1/configurations')
      .set('x-api-key', apiKey)
      .send({ id: 'taken', data: defaultConfigurationData });
    const duplicate = await request(app)
      .post('/v1/configurations')
      .set('x-api-key', apiKey)
      .send({ id: 'taken', data: defaultConfigurationData });
    expect(duplicate.status).toBe(409);

    const missing = await request(app).get('/v1/configurations/missing').set('x-api-key', apiKey);
    expect(missing.status).toBe(404);

    const malformed = await request(app)
      .post('/v1/configurations')
      .set('x-api-key', apiKey)
      .set('Content-Type', 'application/json')
      .send('{');
    expect(malformed.status).toBe(400);
    expect(errorResponseSchema.parse(malformed.body).error.message).toBe('Invalid JSON');
  });
});
