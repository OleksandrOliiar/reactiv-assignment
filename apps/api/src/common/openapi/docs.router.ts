import { apiReference } from '@scalar/express-api-reference';
import { Router } from 'express';

import { createOpenApiDocument } from './document';

export function createDocsRouter() {
  const router = Router();

  router.get('/openapi.json', (_req, res) => {
    res.json(createOpenApiDocument());
  });

  router.use(
    '/docs',
    apiReference({
      url: '/openapi.json',
    }),
  );

  return router;
}
