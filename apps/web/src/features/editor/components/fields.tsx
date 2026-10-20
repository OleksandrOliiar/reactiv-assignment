import { LIMITS } from '@reactiv/contracts';

import { Field, FieldError, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group';
import { Textarea } from '@/shared/ui/textarea';
import { safeHexColor } from '../utils/utils';

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  multiline?: boolean;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  multiline = false,
}: TextFieldProps) {
  const invalid = Boolean(error);
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          maxLength={maxLength}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          id={id}
          value={value}
          maxLength={maxLength}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export function UrlField({
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
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="url"
        inputMode="url"
        value={value}
        maxLength={LIMITS.url}
        aria-invalid={invalid}
        placeholder="https://"
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

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
