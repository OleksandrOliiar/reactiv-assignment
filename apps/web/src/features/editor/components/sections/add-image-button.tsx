import { LIMITS } from '@reactiv/contracts';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import { useEditorActions } from '../editor-store-provider';

export function AddImageButton({
  sectionId,
  imageCount,
}: {
  sectionId: string;
  imageCount: number;
}) {
  const { addImage } = useEditorActions();

  return (
    <Button
      type="button"
      disabled={imageCount >= LIMITS.imagesPerCarousel}
      onClick={() => addImage(sectionId)}
    >
      <Plus />
      Add image
    </Button>
  );
}
