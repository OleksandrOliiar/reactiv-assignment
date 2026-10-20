import { configurationDataSchema, type ErrorDetail } from '@reactiv/contracts';
import type { ZodError } from 'zod';

import type {
  DraftDocument,
  DraftSection,
  FieldErrors,
  SectionOf,
  SectionType,
} from '@/features/editor/types/types';
import type { EditorState } from '@/features/editor/store/types';

export function createSection(type: SectionType, createId: () => string): DraftSection {
  const id = createId();
  if (type === 'carousel') {
    return { id, type, aspectRatio: 'landscape', images: [] };
  }
  if (type === 'text') {
    return {
      id,
      type,
      title: { text: 'Title', color: '#111827' },
      description: { text: 'Description', color: '#4B5563' },
    };
  }
  return {
    id,
    type: 'cta',
    label: 'Shop now',
    url: 'https://example.com',
    buttonColor: '#111827',
    labelColor: '#FFFFFF',
  };
}

export function duplicateSection(section: DraftSection, createId: () => string): DraftSection {
  if (section.type === 'carousel') {
    return {
      ...structuredClone(section),
      id: createId(),
      images: section.images.map((image) => ({ ...image, id: createId() })),
    };
  }
  return { ...structuredClone(section), id: createId() };
}

/**
 * Groups error details by the section that owns them. Paths may carry a prefix,
 * such as `body.data.sections.0.url` from the API.
 */
export function detailsToFieldErrors(document: DraftDocument, details: ErrorDetail[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const detail of details) {
    const parts = detail.path.split('.');
    const sectionsIndex = parts.lastIndexOf('sections');
    const index = Number(parts[sectionsIndex + 1]);
    const section =
      sectionsIndex >= 0 && Number.isInteger(index) ? document.sections[index] : undefined;
    const sectionKey = section?.id ?? '_screen';
    const field = section
      ? parts.slice(sectionsIndex + 2).join('.') || 'section'
      : detail.path || 'screen';
    const fields = errors[sectionKey] ?? {};
    if (!fields[field]) fields[field] = detail.message;
    errors[sectionKey] = fields;
  }
  return errors;
}

export function issuesToFieldErrors(
  document: DraftDocument,
  issues: ZodError['issues'],
): FieldErrors {
  return detailsToFieldErrors(
    document,
    issues.map((issue) => ({ path: issue.path.map(String).join('.'), message: issue.message })),
  );
}

export function validate(document: DraftDocument): FieldErrors {
  const parsed = configurationDataSchema.safeParse(document);
  return parsed.success ? {} : issuesToFieldErrors(document, parsed.error.issues);
}

export function moveById<T extends { id: string }>(
  items: T[],
  id: string,
  direction: 'up' | 'down',
): T[] {
  const from = items.findIndex((item) => item.id === id);
  if (from < 0) return items;
  const to = direction === 'up' ? from - 1 : from + 1;
  if (to < 0 || to >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  if (!item) return items;
  next.splice(to, 0, item);
  return next;
}

export function findCarousel(
  state: EditorState,
  sectionId: string,
): SectionOf<'carousel'> | undefined {
  return state.document.sections.find((section): section is SectionOf<'carousel'> => {
    return section.type === 'carousel' && section.id === sectionId;
  });
}
