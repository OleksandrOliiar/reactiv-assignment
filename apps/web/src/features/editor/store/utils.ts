import { configurationDataSchema } from '@reactiv/contracts';

import type { DraftSection, SectionType } from '@/features/editor/types/types';
import type { DraftDocument, EditorStore, FieldErrors } from '@/features/editor/store/types';

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

export function serverDetailsToFieldErrors(
  document: DraftDocument,
  details: { path: string; message: string }[],
): FieldErrors {
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

export function validate(document: DraftDocument): FieldErrors {
  const parsed = configurationDataSchema.safeParse(document);
  if (parsed.success) return {};

  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const [head, index, ...rest] = issue.path;
    const section =
      head === 'sections' && typeof index === 'number' ? document.sections[index] : undefined;
    const sectionKey = section?.id ?? '_screen';
    const field = section
      ? rest.map(String).join('.') || 'section'
      : issue.path.map(String).join('.') || 'screen';
    const fields = errors[sectionKey] ?? {};
    if (!fields[field]) fields[field] = issue.message;
    errors[sectionKey] = fields;
  }
  return errors;
}

export function clampIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), length);
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

type CarouselSection = Extract<DraftSection, { type: 'carousel' }>;

export function findCarousel(store: EditorStore, sectionId: string): CarouselSection | undefined {
  return store.state.document.sections.find((section): section is CarouselSection => {
    return section.type === 'carousel' && section.id === sectionId;
  });
}
