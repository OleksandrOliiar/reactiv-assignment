'use client';

import { GalleryHorizontal, MousePointerClick, Type } from 'lucide-react';

import type { DraftSection, SectionType } from '@/features/editor/draft';
import { CarouselEditor } from '@/features/sections/carousel/carousel-editor';
import { CarouselPreview } from '@/features/sections/carousel/carousel-preview';
import { CtaEditor } from '@/features/sections/cta/cta-editor';
import { CtaPreview } from '@/features/sections/cta/cta-preview';
import { TextEditor } from '@/features/sections/text/text-editor';
import { TextPreview } from '@/features/sections/text/text-preview';
import type { SectionDefinition, SectionErrors } from '@/features/sections/types';

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
} as const satisfies { [K in SectionType]: SectionDefinition<Extract<DraftSection, { type: K }>> };

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
