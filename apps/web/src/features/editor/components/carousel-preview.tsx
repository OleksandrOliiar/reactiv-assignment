'use client';

import { ImageOff } from 'lucide-react';
import { useState } from 'react';

import { httpUrlSchema, type AspectRatio } from '@reactiv/contracts';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty';
import { cn } from '@/shared/lib/utils';

import type { DraftSection } from '../types/types';

const ASPECT_CLASS: Record<AspectRatio, string> = {
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-video',
  square: 'aspect-square',
};

export function CarouselPreview({
  section,
}: {
  section: Extract<DraftSection, { type: 'carousel' }>;
}) {
  if (section.images.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageOff />
          </EmptyMedia>
          <EmptyTitle>Carousel is empty</EmptyTitle>
          <EmptyDescription>Images you add will appear here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Carousel opts={{ align: 'start' }}>
      <CarouselContent>
        {section.images.map((image, index) => (
          <CarouselItem key={image.id}>
            <div
              className={cn(
                'overflow-hidden rounded-lg bg-muted',
                ASPECT_CLASS[section.aspectRatio],
              )}
            >
              <SlideImage key={image.url} url={image.url} label={`Carousel image ${index + 1}`} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}

function SlideImage({ url, label }: { url: string; label: string }) {
  const [failed, setFailed] = useState(false);

  if (!httpUrlSchema.safeParse(url).success || failed) {
    return (
      <Empty className="h-full border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageOff />
          </EmptyMedia>
          <EmptyTitle>Image unavailable</EmptyTitle>
          <EmptyDescription>Use an http or https image URL.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    // User-supplied remote URLs are not part of the Next.js image allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={label} className="size-full object-cover" onError={() => setFailed(true)} />
  );
}
