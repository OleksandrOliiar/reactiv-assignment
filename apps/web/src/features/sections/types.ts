import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

import type { DraftSection } from '@/features/editor/draft';

export type SectionErrors = Record<string, string>;

export type SectionDefinition<T extends DraftSection> = {
  type: T['type'];
  label: string;
  icon: LucideIcon;
  Editor: ComponentType<{ section: T; errors: SectionErrors }>;
  Preview: ComponentType<{ section: T }>;
};
