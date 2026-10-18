'use client';

import { ASPECT_RATIOS, LIMITS, type AspectRatio } from '@reactiv/contracts';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

import { useEditorStore } from '@/features/editor/editor-store-provider';
import type { DraftSection } from '@/features/editor/draft';
import { UrlField } from '@/features/sections/fields';
import type { SectionErrors } from '@/features/sections/types';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/ui/empty';
import { Field, FieldError, FieldLabel } from '@/shared/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

const ASPECT_LABELS: Record<AspectRatio, string> = {
  portrait: 'Portrait',
  landscape: 'Landscape',
  square: 'Square',
};

export function CarouselEditor({
  section,
  errors,
}: {
  section: Extract<DraftSection, { type: 'carousel' }>;
  errors: SectionErrors;
}) {
  const updateSection = useEditorStore((state) => state.updateSection);
  const addImage = useEditorStore((state) => state.addImage);
  const updateImage = useEditorStore((state) => state.updateImage);
  const removeImage = useEditorStore((state) => state.removeImage);
  const moveImage = useEditorStore((state) => state.moveImage);
  const atImageLimit = section.images.length >= LIMITS.imagesPerCarousel;

  return (
    <div className="flex flex-col gap-5">
      <Field data-invalid={Boolean(errors.aspectRatio) || undefined}>
        <FieldLabel htmlFor={`${section.id}-aspect`}>Aspect ratio</FieldLabel>
        <Select
          value={section.aspectRatio}
          onValueChange={(value) => {
            if (!isAspectRatio(value)) return;
            updateSection(section.id, (current) =>
              current.type === 'carousel' ? { ...current, aspectRatio: value } : current,
            );
          }}
        >
          <SelectTrigger
            id={`${section.id}-aspect`}
            className="w-full"
            aria-invalid={Boolean(errors.aspectRatio)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIOS.map((ratio) => (
              <SelectItem key={ratio} value={ratio}>
                {ASPECT_LABELS[ratio]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.aspectRatio}</FieldError>
      </Field>

      {section.images.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No images yet</EmptyTitle>
            <EmptyDescription>Add an image URL to show it in the carousel.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        section.images.map((image, index) => (
          <Card key={image.id}>
            <CardHeader>
              <CardTitle>Image {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <UrlField
                id={`${section.id}-${image.id}-url`}
                label="Image URL"
                value={image.url}
                error={errors[`images.${index}.url`]}
                onChange={(url) =>
                  updateImage(section.id, image.id, (current) => ({
                    ...current,
                    url,
                  }))
                }
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Move image up"
                  disabled={index === 0}
                  onClick={() => moveImage(section.id, image.id, 'up')}
                >
                  <ChevronUp />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Move image down"
                  disabled={index === section.images.length - 1}
                  onClick={() => moveImage(section.id, image.id, 'down')}
                >
                  <ChevronDown />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Remove image"
                  onClick={() => removeImage(section.id, image.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {errors.images ? (
        <Alert variant="destructive">
          <AlertDescription>{errors.images}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="button"
        variant="outline"
        disabled={atImageLimit}
        onClick={() => addImage(section.id)}
      >
        <Plus />
        Add image
      </Button>
    </div>
  );
}

function isAspectRatio(value: string): value is AspectRatio {
  return (ASPECT_RATIOS as readonly string[]).includes(value);
}
