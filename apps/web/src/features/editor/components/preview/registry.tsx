import type { ComponentType } from 'react';

import type { DraftSection, SectionOf, SectionType } from '../../types/types';
import { CarouselPreview } from './carousel-preview';
import { CtaPreview } from './cta-preview';
import { TextPreview } from './text-preview';

/** Keyed by section type, so a new type fails typecheck until it has a preview. */
const previews = {
  carousel: CarouselPreview,
  text: TextPreview,
  cta: CtaPreview,
} as const satisfies { [K in SectionType]: ComponentType<{ section: SectionOf<K> }> };

export function SectionPreview({ section }: { section: DraftSection }) {
  switch (section.type) {
    case 'carousel':
      return <previews.carousel section={section} />;
    case 'text':
      return <previews.text section={section} />;
    case 'cta':
      return <previews.cta section={section} />;
  }
}
