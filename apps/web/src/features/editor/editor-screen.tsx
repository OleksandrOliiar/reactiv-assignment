'use client';

import { useEditorStore, useIsDirty, useValidation } from '@/features/editor/editor-store-provider';
import type { DraftSection } from '@/features/editor/draft';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/shared/ui/field';

export function EditorScreen() {
  const id = useEditorStore((state) => state.id);
  const version = useEditorStore((state) => state.version);
  const isNew = useEditorStore((state) => state.isNew);
  const sections = useEditorStore((state) => state.document.sections);
  const dirty = useIsDirty();
  const errors = useValidation();
  const errorCount = Object.values(errors).reduce(
    (count, fields) => count + Object.keys(fields).length,
    0,
  );

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
              <FieldDescription>{id}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Version</FieldLabel>
              <FieldDescription>{version}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Badge variant={dirty || isNew ? 'secondary' : 'default'}>
                {statusLabel(isNew, dirty)}
              </Badge>
              {errorCount > 0 ? <Badge variant="destructive">{errorCount} errors</Badge> : null}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {sections.map((section, index) => (
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

function statusLabel(isNew: boolean, dirty: boolean): string {
  if (dirty) return 'Unsaved changes';
  if (isNew) return 'Not saved yet';
  return 'Saved';
}

function sectionLabel(section: DraftSection): string {
  if (section.type === 'text') return section.title.text;
  if (section.type === 'cta') return section.label;
  return 'Image carousel';
}
