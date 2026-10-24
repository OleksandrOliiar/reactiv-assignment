import { Field, FieldError, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

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
