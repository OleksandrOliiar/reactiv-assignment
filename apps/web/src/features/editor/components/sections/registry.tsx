import { GalleryHorizontal, MousePointerClick, Type, type LucideIcon } from 'lucide-react';

import type { DraftSection, SectionErrors, SectionType } from '../../types/types';
import { CarouselEditor } from './carousel-editor';
import { CtaEditor } from './cta-editor';
import { TextEditor } from './text-editor';

type SectionDefinition<T extends SectionType> = {
  type: T;
  label: string;
  icon: LucideIcon;
};

/** Keyed by section type, so a new type fails typecheck until it has a label and an icon. */
export const sectionRegistry = {
  carousel: {
    type: 'carousel',
    label: 'Image carousel',
    icon: GalleryHorizontal,
  },
  text: {
    type: 'text',
    label: 'Text',
    icon: Type,
  },
  cta: {
    type: 'cta',
    label: 'Call to action',
    icon: MousePointerClick,
  },
} as const satisfies { [K in SectionType]: SectionDefinition<K> };

export function SectionEditor({
  section,
  errors,
}: {
  section: DraftSection;
  errors: SectionErrors;
}) {
  switch (section.type) {
    case 'carousel':
      return <CarouselEditor section={section} errors={errors} />;
    case 'text':
      return <TextEditor section={section} errors={errors} />;
    case 'cta':
      return <CtaEditor section={section} errors={errors} />;
  }
}
