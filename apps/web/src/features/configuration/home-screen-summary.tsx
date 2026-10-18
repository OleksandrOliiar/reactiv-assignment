import type { Section } from '@reactiv/contracts';

import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/shared/ui/field';
import type { LoadedConfiguration } from '@/features/configuration/types';

export function HomeScreenSummary({ loaded }: { loaded: LoadedConfiguration }) {
  const { configuration, isNew } = loaded;

  return (
    <FieldGroup className="mx-auto w-full max-w-3xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardDescription>Mobile home screen</CardDescription>
          <CardTitle>Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Id</FieldLabel>
              <FieldDescription>{configuration.id}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Version</FieldLabel>
              <FieldDescription>{configuration.version}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Badge variant={isNew ? 'secondary' : 'default'}>
                {isNew ? 'Not saved yet' : 'Saved'}
              </Badge>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {configuration.data.sections.map((section, index) => (
        <Card key={section.id}>
          <CardHeader>
            <Badge variant="outline">{section.type}</Badge>
            <CardTitle>
              {index + 1}. {sectionLabel(section)}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </FieldGroup>
  );
}

function sectionLabel(section: Section): string {
  if (section.type === 'text') return section.title.text;
  if (section.type === 'cta') return section.label;
  return 'Image carousel';
}
