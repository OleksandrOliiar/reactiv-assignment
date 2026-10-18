'use client';

import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { useEditorActions } from './editor-store-provider';
import { LIMITS } from '@reactiv/contracts';

export function AddImageButton({
  sectionId,
  sectionImagesLength,
}: {
  sectionId: string;
  sectionImagesLength: number;
}) {
  const { addImage } = useEditorActions();

  const atImageLimit = sectionImagesLength >= LIMITS.imagesPerCarousel;

  return (
    <Button
      type="button"
      variant="outline"
      disabled={atImageLimit}
      onClick={() => addImage(sectionId)}
    >
      <Plus />
      Add image
    </Button>
  );
}
