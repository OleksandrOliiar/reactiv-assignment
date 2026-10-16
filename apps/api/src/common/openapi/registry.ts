import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {
  configurationSchema,
  createConfigurationRequestSchema,
  errorResponseSchema,
  updateConfigurationRequestSchema,
} from '@reactiv/contracts';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

/**
 * `@reactiv/contracts` and this package can end up with two copies of Zod in
 * memory. `extendZodWithOpenApi` only patches the copy imported here, so copy
 * the added method onto the schema prototype we actually received.
 */
function registerSchema<T extends z.ZodType>(name: string, schema: T): T {
  const prototype: { openapi?: z.ZodType['openapi'] } = Object.getPrototypeOf(schema);
  if (typeof prototype.openapi !== 'function') {
    prototype.openapi = z.ZodType.prototype.openapi;
  }
  return registry.register(name, schema);
}

registerSchema('Configuration', configurationSchema);
registerSchema('CreateConfigurationRequest', createConfigurationRequestSchema);
registerSchema('UpdateConfigurationRequest', updateConfigurationRequestSchema);
registerSchema('ErrorResponse', errorResponseSchema);

export const apiKeySecurity = registry.registerComponent('securitySchemes', 'apiKey', {
  type: 'apiKey',
  in: 'header',
  name: 'x-api-key',
});
