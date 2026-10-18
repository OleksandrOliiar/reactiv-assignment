'use client';

import { LIMITS } from '@reactiv/contracts';

import type { DraftSection, SectionErrors } from '../types/types';
import { useEditorStore } from './editor-store-provider';
import { ColorField, TextField, UrlField } from './fields';

export function CtaEditor({
  section,
  errors,
}: {
  section: Extract<DraftSection, { type: 'cta' }>;
  errors: SectionErrors;
}) {
  const updateSection = useEditorStore((store) => store.actions.updateSection);

  function update(
    patch: Partial<Pick<typeof section, 'label' | 'url' | 'buttonColor' | 'labelColor'>>,
  ) {
    updateSection(section.id, (current) =>
      current.type === 'cta' ? { ...current, ...patch } : current,
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <TextField
        id={`${section.id}-label`}
        label="Button label"
        value={section.label}
        maxLength={LIMITS.buttonLabel}
        error={errors.label}
        onChange={(label) => update({ label })}
      />
      <UrlField
        id={`${section.id}-url`}
        label="Button URL"
        value={section.url}
        error={errors.url}
        onChange={(url) => update({ url })}
      />
      <ColorField
        id={`${section.id}-button-color`}
        label="Button color"
        value={section.buttonColor}
        error={errors.buttonColor}
        onChange={(buttonColor) => update({ buttonColor })}
      />
      <ColorField
        id={`${section.id}-label-color`}
        label="Label color"
        value={section.labelColor}
        error={errors.labelColor}
        onChange={(labelColor) => update({ labelColor })}
      />
    </div>
  );
}
