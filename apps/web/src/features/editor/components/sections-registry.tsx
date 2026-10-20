import { GalleryHorizontal, MousePointerClick, Type, type LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

import type { DraftSection, SectionErrors, SectionOf, SectionType } from '../types/types';
import { CarouselEditor } from './carousel-editor';
import { CarouselPreview } from './carousel-preview';
import { CtaEditor } from './cta-editor';
import { CtaPreview } from './cta-preview';
import { TextEditor } from './text-editor';
import { TextPreview } from './text-preview';

type SectionDefinition<T extends DraftSection> = {
  type: T['type'];
  label: string;
  icon: LucideIcon;
  Editor: ComponentType<{ section: T; errors: SectionErrors }>;
  Preview: ComponentType<{ section: T }>;
};

export const sectionRegistry = {
  carousel: {
    type: 'carousel',
    label: 'Image carousel',
    icon: GalleryHorizontal,
    Editor: CarouselEditor,
    Preview: CarouselPreview,
  },
  text: {
    type: 'text',
    label: 'Text',
    icon: Type,
    Editor: TextEditor,
    Preview: TextPreview,
  },
  cta: {
    type: 'cta',
    label: 'Call to action',
    icon: MousePointerClick,
    Editor: CtaEditor,
    Preview: CtaPreview,
  },
} as const satisfies { [K in SectionType]: SectionDefinition<SectionOf<K>> };

export function SectionEditor({
  section,
  errors,
}: {
  section: DraftSection;
  errors: SectionErrors;
}) {
  switch (section.type) {
    case 'carousel':
      return <sectionRegistry.carousel.Editor section={section} errors={errors} />;
    case 'text':
      return <sectionRegistry.text.Editor section={section} errors={errors} />;
    case 'cta':
      return <sectionRegistry.cta.Editor section={section} errors={errors} />;
  }
}

export function SectionPreview({ section }: { section: DraftSection }) {
  switch (section.type) {
    case 'carousel':
      return <sectionRegistry.carousel.Preview section={section} />;
    case 'text':
      return <sectionRegistry.text.Preview section={section} />;
    case 'cta':
      return <sectionRegistry.cta.Preview section={section} />;
  }
}
