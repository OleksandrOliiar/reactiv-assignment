'use client';

import { useEditorStore, useIsDirty, useValidation } from '@/features/editor/editor-store-provider';
import type { DraftSection } from '@/features/editor/draft';
import { SectionEditor, SectionPreview, sectionRegistry } from '@/features/sections/registry';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/ui/empty';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/shared/ui/field';

export function EditorScreen() {
  const id = useEditorStore((state) => state.id);
  const version = useEditorStore((state) => state.version);
  const isNew = useEditorStore((state) => state.isNew);
  const sections = useEditorStore((state) => state.document.sections);
  const selectedSectionId = useEditorStore((state) => state.selectedSectionId);
  const selectSection = useEditorStore((state) => state.selectSection);
  const dirty = useIsDirty();
  const errors = useValidation();
  const errorCount = Object.values(errors).reduce(
    (count, fields) => count + Object.keys(fields).length,
    0,
  );
  const selected = sections.find((section) => section.id === selectedSectionId) ?? null;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Sections</CardTitle>
            <CardDescription>Select a section to edit it.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {sections.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No sections</EmptyTitle>
                  <EmptyDescription>The screen has nothing to edit yet.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              sections.map((section, index) => {
                const definition = sectionRegistry[section.type];
                const Icon = definition.icon;
                const selectedSection = section.id === selectedSectionId;
                return (
                  <Button
                    key={section.id}
                    type="button"
                    variant={selectedSection ? 'secondary' : 'outline'}
                    className="h-auto w-full justify-start"
                    aria-pressed={selectedSection}
                    onClick={() => selectSection(section.id)}
                  >
                    <Icon />
                    {index + 1}. {sectionLabel(section)}
                    <Badge variant="outline">{definition.label}</Badge>
                  </Button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selected ? sectionRegistry[selected.type].label : 'Section'}</CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <SectionEditor section={selected} errors={errors[selected.id] ?? {}} />
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Nothing selected</EmptyTitle>
                  <EmptyDescription>Choose a section from the list.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Updates as you edit.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sections.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Nothing to preview</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            sections.map((section) => <SectionPreview key={section.id} section={section} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function statusLabel(isNew: boolean, dirty: boolean): string {
  if (dirty) return 'Unsaved changes';
  if (isNew) return 'Not saved yet';
  return 'Saved';
}

function sectionLabel(section: DraftSection): string {
  if (section.type === 'text') return section.title.text || 'Untitled';
  if (section.type === 'cta') return section.label || 'Button';
  return 'Image carousel';
}
