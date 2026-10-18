'use client';

import { LIMITS } from '@reactiv/contracts';

import { useEditorStore } from '@/features/editor/editor-store-provider';
import type { DraftSection } from '@/features/editor/draft';
import { ColorField, TextField } from '@/features/sections/fields';
import type { SectionErrors } from '@/features/sections/types';

export function TextEditor({
  section,
  errors,
}: {
  section: Extract<DraftSection, { type: 'text' }>;
  errors: SectionErrors;
}) {
  const updateSection = useEditorStore((state) => state.updateSection);

  function updateBlock(block: 'title' | 'description', key: 'text' | 'color', value: string) {
    updateSection(section.id, (current) => {
      if (current.type !== 'text') return current;
      return { ...current, [block]: { ...current[block], [key]: value } };
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <TextField
        id={`${section.id}-title`}
        label="Title"
        value={section.title.text}
        maxLength={LIMITS.title}
        error={errors['title.text']}
        onChange={(value) => updateBlock('title', 'text', value)}
      />
      <ColorField
        id={`${section.id}-title-color`}
        label="Title color"
        value={section.title.color}
        error={errors['title.color']}
        onChange={(value) => updateBlock('title', 'color', value)}
      />
      <TextField
        id={`${section.id}-description`}
        label="Description"
        value={section.description.text}
        maxLength={LIMITS.description}
        multiline
        error={errors['description.text']}
        onChange={(value) => updateBlock('description', 'text', value)}
      />
      <ColorField
        id={`${section.id}-description-color`}
        label="Description color"
        value={section.description.color}
        error={errors['description.color']}
        onChange={(value) => updateBlock('description', 'color', value)}
      />
    </div>
  );
}
