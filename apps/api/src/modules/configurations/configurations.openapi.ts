import {
  configurationSchema,
  createConfigurationRequestSchema,
  errorResponseSchema,
  updateConfigurationRequestSchema,
} from '@reactiv/contracts';
import type { ZodType } from 'zod';

import { apiKeySecurity, registry } from '../../common/openapi/registry';
import { configurationIdParamsSchema } from './configurations.routes';

const json = (schema: ZodType) => ({
  'application/json': { schema },
});

const errorResponse = (description: string) => ({
  description,
  content: json(errorResponseSchema),
});

registry.registerPath({
  method: 'get',
  path: '/v1/configurations/{id}',
  summary: 'Load a configuration',
  security: [{ [apiKeySecurity.name]: [] }],
  request: { params: configurationIdParamsSchema },
  responses: {
    '200': {
      description: 'The stored configuration',
      content: json(configurationSchema),
    },
    '401': errorResponse('Missing or invalid API key'),
    '404': errorResponse('No configuration with this id'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/v1/configurations',
  summary: 'Create a configuration',
  security: [{ [apiKeySecurity.name]: [] }],
  request: {
    body: {
      required: true,
      content: json(createConfigurationRequestSchema),
    },
  },
  responses: {
    '201': {
      description: 'Created configuration',
      headers: {
        Location: {
          description: 'URL of the new configuration',
          schema: { type: 'string' },
        },
      },
      content: json(configurationSchema),
    },
    '400': errorResponse('Invalid configuration'),
    '401': errorResponse('Missing or invalid API key'),
    '409': errorResponse('A configuration with this id already exists'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/v1/configurations/{id}',
  summary: 'Replace a configuration',
  description:
    'Replaces the whole document. Send the version you loaded. A mismatch returns 409 with the current version.',
  security: [{ [apiKeySecurity.name]: [] }],
  request: {
    params: configurationIdParamsSchema,
    body: {
      required: true,
      content: json(updateConfigurationRequestSchema),
    },
  },
  responses: {
    '200': {
      description: 'The saved configuration',
      content: json(configurationSchema),
    },
    '400': errorResponse('Invalid configuration'),
    '401': errorResponse('Missing or invalid API key'),
    '404': errorResponse('No configuration with this id'),
    '409': errorResponse('The configuration changed since it was loaded'),
  },
});
