import { describe, expect, it } from 'vitest';

import { createOpenApiDocument } from './document';

describe('createOpenApiDocument', () => {
  it('publishes the contract schemas and the API key scheme', () => {
    const document = createOpenApiDocument();

    expect(document.openapi).toBe('3.1.0');
    expect(document.components?.schemas).toMatchObject({
      Configuration: expect.any(Object),
      CreateConfigurationRequest: expect.any(Object),
      UpdateConfigurationRequest: expect.any(Object),
      ErrorResponse: expect.any(Object),
    });
    expect(document.components?.securitySchemes).toMatchObject({
      apiKey: { type: 'apiKey', in: 'header', name: 'x-api-key' },
    });
  });
});
