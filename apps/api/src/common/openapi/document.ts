import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';

import { registry } from './registry';

/**
 * Built on demand so feature modules can register paths during import
 * before the first request asks for the document.
 */
export function createOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Configuration service',
      version: '1.0.0',
      description:
        'Private API for mobile home screen configurations. Send the API key in the x-api-key header.',
    },
  });
}
