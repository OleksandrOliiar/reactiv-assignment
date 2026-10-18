'use client';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/ui/empty';
import { Field, FieldError, FieldLabel } from '@/shared/ui/field';

import type { DraftSection, SectionErrors } from '../types/types';
import { AddImageButton } from './add-image-button';
import { AspectRatioSelect } from './aspect-ratio-select';
import { ImageCard } from './image-card';

export function CarouselEditor({
  section,
  errors,
}: {
  section: Extract<DraftSection, { type: 'carousel' }>;
  errors: SectionErrors;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field data-invalid={Boolean(errors.aspectRatio) || undefined}>
        <FieldLabel htmlFor={`${section.id}-aspect`}>Aspect ratio</FieldLabel>
        <AspectRatioSelect
          sectionId={section.id}
          currentValue={section.aspectRatio}
          errors={errors}
        />
        <FieldError>{errors.aspectRatio}</FieldError>
      </Field>
      {section.images.length === 0 ? (
        <NoImagesMessage />
      ) : (
        section.images.map((image, index) => (
          <ImageCard
            key={image.id}
            index={index}
            sectionId={section.id}
            image={image}
            errors={errors}
            isLastImage={index === section.images.length - 1}
          />
        ))
      )}
      {errors.images ? (
        <Alert variant="destructive">
          <AlertDescription>{errors.images}</AlertDescription>
        </Alert>
      ) : null}
      <AddImageButton sectionId={section.id} sectionImagesLength={section.images.length} />
    </div>
  );
}

function NoImagesMessage() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>No images yet</EmptyTitle>
        <EmptyDescription>Add an image URL to show it in the carousel.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
