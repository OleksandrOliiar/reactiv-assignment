import { LIMITS } from '@reactiv/contracts';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/ui/empty';
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/shared/ui/field';

import type { SectionErrors, SectionOf } from '../types/types';
import { AddImageButton } from './add-image-button';
import { AspectRatioSelect } from './aspect-ratio-select';
import { ImageCard } from './image-card';

export function CarouselEditor({
  section,
  errors,
}: {
  section: SectionOf<'carousel'>;
  errors: SectionErrors;
}) {
  const aspectId = `${section.id}-aspect`;

  return (
    <div className="flex flex-col gap-6">
      <Field data-invalid={Boolean(errors.aspectRatio) || undefined}>
        <FieldLabel htmlFor={aspectId}>Aspect ratio</FieldLabel>
        <AspectRatioSelect id={aspectId} section={section} invalid={Boolean(errors.aspectRatio)} />
        <FieldError>{errors.aspectRatio}</FieldError>
      </Field>
      <FieldSet className="gap-3">
        <FieldLegend
          variant="label"
          className="mb-3 flex w-full items-center justify-between gap-2"
        >
          Images
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {section.images.length} of {LIMITS.imagesPerCarousel}
          </span>
        </FieldLegend>
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
        <AddImageButton sectionId={section.id} imageCount={section.images.length} />
      </FieldSet>
    </div>
  );
}

function NoImagesMessage() {
  return (
    <Empty className="border border-dashed p-6">
      <EmptyHeader>
        <EmptyTitle>No images yet</EmptyTitle>
        <EmptyDescription>Add an image URL to show it in the carousel.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
