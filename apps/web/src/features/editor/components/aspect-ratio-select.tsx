'use client';

import { ASPECT_RATIOS, AspectRatio } from '@reactiv/contracts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useEditorActions } from './editor-store-provider';
import { SectionErrors } from '../types/types';

const ASPECT_LABELS: Record<AspectRatio, string> = {
  portrait: 'Portrait',
  landscape: 'Landscape',
  square: 'Square',
};

export function AspectRatioSelect({
  sectionId,
  currentValue,
  errors,
}: {
  sectionId: string;
  currentValue: AspectRatio;
  errors: SectionErrors;
}) {
  const { updateSection } = useEditorActions();

  function handleAspectRatioChange(value: string) {
    updateSection(sectionId, (current) =>
      current.type === 'carousel' ? { ...current, aspectRatio: value as AspectRatio } : current,
    );
  }

  return (
    <Select value={currentValue} onValueChange={handleAspectRatioChange}>
      <SelectTrigger
        id={`${sectionId}-aspect`}
        className="w-full"
        aria-invalid={Boolean(errors.aspectRatio)}
      >
        <SelectValue>{ASPECT_LABELS[currentValue]}</SelectValue>
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
