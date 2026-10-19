import { hexColorSchema } from '@reactiv/contracts';
import {
  CURRENT_SCHEMA_VERSION,
  UnsupportedSchemaVersionError,
  configurationDataSchema,
  importFileEnvelopeSchema,
  migrateConfigurationData,
} from '@reactiv/contracts';
import type { ConfigurationData, ExportFile } from '@reactiv/contracts';
import type { ZodError } from 'zod';

import type { DraftDocument } from '@/features/editor/store/types';
import type { DraftSection } from '../types/types';

export function sectionTitle(section: DraftSection): string {
  if (section.type === 'text') return section.title.text || 'Untitled text';
  if (section.type === 'cta') return section.label || 'Untitled button';
  return `Carousel, ${section.images.length} ${section.images.length === 1 ? 'image' : 'images'}`;
}

/**
 * A six-digit color for the picker and preview. `#RGB` is expanded because
 * `<input type="color">` only accepts `#RRGGBB`. Invalid drafts return undefined.
 */
export function safeHexColor(value: string): string | undefined {
  const parsed = hexColorSchema.safeParse(value);
  if (!parsed.success) return undefined;
  if (parsed.data.length === 4) {
    const [red, green, blue] = parsed.data.slice(1);
    return `#${red}${red}${green}${green}${blue}${blue}`;
  }
  return parsed.data;
}

/** A home screen export is a small JSON document. Reject anything larger. */
export const MAX_IMPORT_BYTES = 1_048_576;

export type ImportFailureStatus =
  'invalid_json' | 'unsupported_version' | 'invalid_shape' | 'too_large';

export type ImportFailure = {
  status: ImportFailureStatus;
  message: string;
};

export type ImportResult = { status: 'imported'; data: ConfigurationData } | ImportFailure;

export const INVALID_JSON = 'This file is not valid JSON.';
const TOO_LARGE = 'Import files must be 1 MB or smaller.';
const INVALID_SHAPE = 'This file does not match a home screen export.';

export function createExportFile(
  document: DraftDocument,
  exportedAt = new Date().toISOString(),
): ExportFile | null {
  const data = configurationDataSchema.safeParse(document);
  if (!data.success) return null;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt,
    data: data.data,
  };
}

export function isImportTooLarge(bytes: number): ImportFailure | null {
  if (bytes <= MAX_IMPORT_BYTES) return null;
  return { status: 'too_large', message: TOO_LARGE };
}

export function parseImportText(text: string): ImportResult {
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { status: 'invalid_json', message: INVALID_JSON };
  }

  const envelope = importFileEnvelopeSchema.safeParse(json);
  if (!envelope.success) {
    return { status: 'invalid_shape', message: issueMessage(envelope.error) };
  }

  let migrated;
  try {
    migrated = migrateConfigurationData(envelope.data.data, envelope.data.schemaVersion);
  } catch (error) {
    if (error instanceof UnsupportedSchemaVersionError) {
      return { status: 'unsupported_version', message: error.message };
    }
    throw error;
  }

  const data = configurationDataSchema.safeParse(migrated);
  if (!data.success) {
    return { status: 'invalid_shape', message: issueMessage(data.error) };
  }

  return { status: 'imported', data: data.data };
}

function issueMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue || issue.path.length === 0) return INVALID_SHAPE;
  return `${issue.path.map(String).join('.')}: ${issue.message}`;
}

export function downloadExport(file: ExportFile) {
  const blob = new Blob([`${JSON.stringify(file, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'home-screen.json';
  link.click();
  URL.revokeObjectURL(url);
}