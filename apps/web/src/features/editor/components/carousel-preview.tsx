import { ImageOff } from 'lucide-react';

import { type AspectRatio } from '@reactiv/contracts';

import { cn } from '@/shared/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty';

import type { SectionOf } from '../types/types';
import { SlideImage } from './slide-image';

const ASPECT_CLASS: Record<AspectRatio, string> = {
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-video',
  square: 'aspect-square',
};

export function CarouselPreview({ section }: { section: SectionOf<'carousel'> }) {
  if (section.images.length === 0) {
    return <NoImagesMessage />;
  }

  return (
    <Carousel opts={{ align: 'start' }}>
      <CarouselContent>
        {section.images.map((image, index) => (
          <CarouselItem key={image.id}>
            <div
              className={cn(
                'overflow-hidden rounded-xl bg-muted',
                ASPECT_CLASS[section.aspectRatio],
              )}
            >
              {/* Keyed by URL so a corrected URL clears the previous load failure. */}
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

function NoImagesMessage() {
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
