import { PGlite } from '@electric-sql/pglite';
import { errorResponseSchema, defaultConfigurationData } from '@reactiv/contracts';
import type { ErrorCode } from '@reactiv/contracts';
import { drizzle } from 'drizzle-orm/pglite';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from './app';
import type { Database } from './common/db/client';
import { migrationsFolder } from './common/db/migrate';
import * as schema from './common/db/schema';
import { seedDefaultConfiguration } from './common/db/seed';
import { createLogger } from './common/logger';
import { DrizzleConfigurationsRepository } from './modules/configurations/configurations.repository.drizzle';

const apiKey = 'change-me-to-a-long-random-secret';

/**
 * PGlite and node-postgres expose the same Drizzle query API. The repository
 * is typed for the production driver, which this in-process database satisfies
 * at runtime.
 */
function asDatabase(db: PgliteDatabase<typeof schema>): Database {
  return db as unknown as Database;
}

describe('configuration API on Postgres', () => {
  let client: PGlite;
  let database: ReturnType<typeof asDatabase>;
  let app: Express;

  beforeAll(async () => {
    client = new PGlite();
    const db = drizzle({ client, schema });
    await migrate(db, { migrationsFolder });
    database = asDatabase(db);

    const first = await seedDefaultConfiguration(
      database,
      'default',
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const second = await seedDefaultConfiguration(
      database,
      'default',
      new Date('2026-02-01T00:00:00.000Z'),
    );
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);

    app = createApp({
      configurationsRepository: new DrizzleConfigurationsRepository(database),
      apiKey,
      logger: createLogger('silent'),
    });
  }, 30_000);

  afterAll(async () => {
    await client.close();
  });

  it('loads the seeded configuration', async () => {
    const response = await request(app).get('/v1/configurations/default').set('x-api-key', apiKey);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 'default',
      schemaVersion: 1,
      version: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(response.body.data.sections.map((section: { type: string }) => section.type)).toEqual([
      'carousel',
      'text',
      'cta',
    ]);
  });

  it('rejects a missing or wrong API key', async () => {
    const missing = await request(app).get('/v1/configurations/default');
    expectError(missing, 401, 'UNAUTHORIZED');

    const wrong = await request(app)
      .get('/v1/configurations/default')
      .set('x-api-key', 'not-the-real-api-key');
    expectError(wrong, 401, 'UNAUTHORIZED');
  });

  it('returns 404 for an unknown id', async () => {
    const response = await request(app).get('/v1/configurations/missing').set('x-api-key', apiKey);
    expectError(response, 404, 'NOT_FOUND');
  });

  it('returns field details for an invalid body', async () => {
    const response = await request(app)
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
              buttonColor: 'red',
              labelColor: '#fff',
            },
          ],
        },
      });

    expect(response.status).toBe(400);
    const body = errorResponseSchema.parse(response.body);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details?.map((detail) => detail.path)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('url'),
        expect.stringContaining('buttonColor'),
      ]),
    );
  });

  it('creates, reads, and updates through the database', async () => {
    const created = await request(app)
      .post('/v1/configurations')
      .set('x-api-key', apiKey)
      .send({ id: 'screen-1', data: defaultConfigurationData });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ id: 'screen-1', version: 1 });

    const duplicate = await request(app)
      .post('/v1/configurations')
      .set('x-api-key', apiKey)
      .send({ id: 'screen-1', data: defaultConfigurationData });
    expectError(duplicate, 409, 'CONFLICT');

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
    expectError(conflict, 409, 'CONFLICT');
    expect(errorResponseSchema.parse(conflict.body).error.details).toEqual([
      { path: 'version', message: 'Current version is 2' },
    ]);

    const reloaded = await new DrizzleConfigurationsRepository(database).findById('screen-1');
    expect(reloaded).toMatchObject({ version: 2, data: { sections: text ? [text] : [] } });
  });
});

function expectError(response: { status: number; body: unknown }, status: number, code: ErrorCode) {
  expect(response.status).toBe(status);
  expect(errorResponseSchema.parse(response.body).error.code).toBe(code);
}
