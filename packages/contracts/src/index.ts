export {
  LIMITS,
  entityIdSchema,
  hexColorSchema,
  httpUrlSchema,
  isoDateTimeSchema,
} from './primitives';
export type { EntityId, HexColor, HttpUrl } from './primitives';

export {
  ASPECT_RATIOS,
  aspectRatioSchema,
  carouselImageSchema,
  carouselSectionSchema,
  ctaSectionSchema,
  sectionSchema,
  textSectionSchema,
} from './sections';
export type {
  AspectRatio,
  CarouselImage,
  CarouselSection,
  CtaSection,
  Section,
  TextBlock,
  TextSection,
} from './sections';

export {
  CURRENT_SCHEMA_VERSION,
  configurationDataSchema,
  configurationSchema,
  createConfigurationRequestSchema,
  exportFileSchema,
  importFileEnvelopeSchema,
  updateConfigurationRequestSchema,
} from './configuration';
export type {
  Configuration,
  ConfigurationData,
  CreateConfigurationRequest,
  ExportFile,
  ImportFileEnvelope,
  UpdateConfigurationRequest,
} from './configuration';

export { ERROR_CODES, errorCodeSchema, errorDetailSchema, errorResponseSchema } from './errors';
export type { ErrorCode, ErrorDetail, ErrorResponse } from './errors';

export {
  UnsupportedSchemaVersionError,
  configurationMigrations,
  migrateConfigurationData,
  runMigrations,
} from './migrations';
export type { MigrationStep } from './migrations';

export { createDefaultConfiguration, defaultConfigurationData } from './defaults';
