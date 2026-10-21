import { ASPECT_RATIOS, type AspectRatio } from '@reactiv/contracts';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

import type { SectionOf } from '../../types/types';
import { useEditorActions } from '../editor-store-provider';

const ASPECT_LABELS: Record<AspectRatio, string> = {
  portrait: 'Portrait',
  landscape: 'Landscape',
  square: 'Square',
};

export function AspectRatioSelect({
  id,
  section,
  invalid,
}: {
  id: string;
  section: SectionOf<'carousel'>;
  invalid: boolean;
}) {
  const { updateSection } = useEditorActions();

  return (
    <Select
      value={section.aspectRatio}
      onValueChange={(value) => updateSection(section, { aspectRatio: value as AspectRatio })}
    >
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
        <SelectValue>{ASPECT_LABELS[section.aspectRatio]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ASPECT_RATIOS.map((ratio) => (
          <SelectItem key={ratio} value={ratio}>
            {ASPECT_LABELS[ratio]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
