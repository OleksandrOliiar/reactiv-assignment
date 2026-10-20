import {
  CURRENT_SCHEMA_VERSION,
  UnsupportedSchemaVersionError,
  configurationDataSchema,
  hexColorSchema,
  importFileEnvelopeSchema,
  migrateConfigurationData,
  type ConfigurationData,
  type ExportFile,
} from '@reactiv/contracts';
import type { ZodError } from 'zod';

import type { DraftDocument, DraftSection } from '../types/types';

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

/** A home screen export is a small JSON document. Reject anything larger. */
export const MAX_IMPORT_BYTES = 1_048_576;

export type ImportFailure = { title: string; message: string };
export type ImportResult =
  { ok: true; data: ConfigurationData } | { ok: false; error: ImportFailure };

function failure(title: string, message: string): ImportResult {
  return { ok: false, error: { title, message } };
}

const unreadable = () => failure('Could not read this file', 'This file is not valid JSON.');

export async function readImportFile(file: File): Promise<ImportResult> {
  if (file.size > MAX_IMPORT_BYTES) {
    return failure('This file is too large', 'Import files must be 1 MB or smaller.');
  }
  const text = await file.text().catch(() => null);
  return text === null ? unreadable() : parseImportText(text);
}

export function parseImportText(text: string): ImportResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return unreadable();
  }

  const envelope = importFileEnvelopeSchema.safeParse(json);
  if (!envelope.success) return invalidShape(envelope.error);

  let migrated: unknown;
  try {
    migrated = migrateConfigurationData(envelope.data.data, envelope.data.schemaVersion);
  } catch (error) {
    if (error instanceof UnsupportedSchemaVersionError) {
      return failure('Unsupported file version', error.message);
    }
    throw error;
  }

  const data = configurationDataSchema.safeParse(migrated);
  return data.success ? { ok: true, data: data.data } : invalidShape(data.error);
}

function invalidShape(error: ZodError): ImportResult {
  const issue = error.issues[0];
  const message =
    issue && issue.path.length > 0
      ? `${issue.path.map(String).join('.')}: ${issue.message}`
      : 'This file does not match a home screen export.';
  return failure('This file is not a valid home screen', message);
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
