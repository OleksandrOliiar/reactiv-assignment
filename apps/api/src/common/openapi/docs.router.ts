import { randomBytes } from 'node:crypto';

import { apiReference } from '@scalar/express-api-reference';
import { Router, type RequestHandler, type Response } from 'express';
import helmet from 'helmet';

import { createOpenApiDocument } from './document';

export function createDocsRouter() {
  const router = Router();
  const document = createOpenApiDocument();

  router.get('/openapi.json', (_req, res) => {
    res.json(document);
  });

  // Scalar's page is a CDN script plus an inline bootstrap. Both carry a per-request nonce,
  // and this policy replaces the app-wide one for this page only.
  router.get(
    '/docs',
    (_req, res, next) => {
      res.locals.cspNonce = randomBytes(16).toString('base64');
      next();
    },
    helmet.contentSecurityPolicy({
      directives: {
        scriptSrc: ["'self'", (_req, res) => `'nonce-${(res as Response).locals.cspNonce}'`],
      },
    }),
    (req, res, next) => {
      // Typed `RequestHandler<never>`, so it will not accept this request without the cast.
      const sendDocs = apiReference({
        url: '/openapi.json',
        nonce: res.locals.cspNonce,
      }) as RequestHandler;
      sendDocs(req, res, next);
    },
  );

  return router;
}
