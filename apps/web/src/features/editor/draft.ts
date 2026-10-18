import type { AspectRatio, ConfigurationData } from '@reactiv/contracts';

export type DraftImage = {
  id: string;
  url: string;
};

export type DraftSection =
  | {
      id: string;
      type: 'carousel';
      aspectRatio: AspectRatio;
      images: DraftImage[];
    }
  | {
      id: string;
      type: 'text';
      title: { text: string; color: string };
      description: { text: string; color: string };
    }
  | {
      id: string;
      type: 'cta';
      label: string;
      url: string;
      buttonColor: string;
      labelColor: string;
    };

export type DraftDocument = {
  sections: DraftSection[];
};

export type SectionType = DraftSection['type'];

export function sectionTitle(section: DraftSection): string {
  if (section.type === 'text') return section.title.text || 'Untitled text';
  if (section.type === 'cta') return section.label || 'Untitled button';
  return `Carousel, ${section.images.length} ${section.images.length === 1 ? 'image' : 'images'}`;
}

export function toDraftDocument(data: ConfigurationData): DraftDocument {
  return structuredClone(data);
}

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
