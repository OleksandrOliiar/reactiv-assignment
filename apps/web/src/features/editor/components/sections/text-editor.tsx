import { LIMITS, type TextBlock } from '@reactiv/contracts';

import type { SectionErrors, SectionOf } from '../../types/types';
import { useEditorActions } from '../editor-store-provider';
import { ColorField, TextField } from './fields';

export function TextEditor({
  section,
  errors,
}: {
  section: SectionOf<'text'>;
  errors: SectionErrors;
}) {
  const { updateSection } = useEditorActions();

  function updateBlock(block: 'title' | 'description', patch: Partial<TextBlock>) {
    const next = { ...section[block], ...patch };
    updateSection(section, block === 'title' ? { title: next } : { description: next });
  }

  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-start sm:gap-x-4">
      <TextField
        id={`${section.id}-title`}
        label="Title"
        value={section.title.text}
        maxLength={LIMITS.title}
        error={errors['title.text']}
        onChange={(text) => updateBlock('title', { text })}
      />
      <ColorField
        id={`${section.id}-title-color`}
        label="Title color"
        value={section.title.color}
        error={errors['title.color']}
        onChange={(color) => updateBlock('title', { color })}
      />
      <TextField
        id={`${section.id}-description`}
        label="Description"
        value={section.description.text}
        maxLength={LIMITS.description}
        multiline
        error={errors['description.text']}
        onChange={(text) => updateBlock('description', { text })}
      />
      <ColorField
        id={`${section.id}-description-color`}
        label="Description color"
        value={section.description.color}
        error={errors['description.color']}
        onChange={(color) => updateBlock('description', { color })}
      />
    </div>
  );
}
