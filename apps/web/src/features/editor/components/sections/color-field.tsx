import { Field, FieldError, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group';
import { safeHexColor } from '../../utils/utils';

export function ColorField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const invalid = Boolean(error);
  const pickerValue = safeHexColor(value) ?? '#000000';

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <Input
            type="color"
            aria-label={`${label} picker`}
            value={pickerValue}
            className="size-6 cursor-pointer p-0.5"
            // The addon focuses the text input on click, which would close the native picker.
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onChange(event.target.value)}
          />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          value={value}
          maxLength={7}
          spellCheck={false}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
