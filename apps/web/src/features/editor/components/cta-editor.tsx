import { LIMITS } from '@reactiv/contracts';

import type { SectionErrors, SectionOf } from '../types/types';
import { useEditorActions } from './editor-store-provider';
import { ColorField, TextField, UrlField } from './fields';

export function CtaEditor({
  section,
  errors,
}: {
  section: SectionOf<'cta'>;
  errors: SectionErrors;
}) {
  const { updateSection } = useEditorActions();

  return (
    <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-4">
      <TextField
        id={`${section.id}-label`}
        label="Button label"
        value={section.label}
        maxLength={LIMITS.buttonLabel}
        error={errors.label}
        onChange={(label) => updateSection(section, { label })}
      />
      <UrlField
        id={`${section.id}-url`}
        label="Button URL"
        value={section.url}
        error={errors.url}
        onChange={(url) => updateSection(section, { url })}
      />
      <ColorField
        id={`${section.id}-button-color`}
        label="Button color"
        value={section.buttonColor}
        error={errors.buttonColor}
        onChange={(buttonColor) => updateSection(section, { buttonColor })}
      />
      <ColorField
        id={`${section.id}-label-color`}
        label="Label color"
        value={section.labelColor}
        error={errors.labelColor}
        onChange={(labelColor) => updateSection(section, { labelColor })}
      />
    </div>
  );
}
