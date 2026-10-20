import { LIMITS } from '@reactiv/contracts';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import { useEditorActions } from './editor-store-provider';

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
      variant="outline"
      className="h-9 w-full border-dashed text-muted-foreground hover:border-primary/40 hover:text-foreground"
      disabled={imageCount >= LIMITS.imagesPerCarousel}
      onClick={() => addImage(sectionId)}
    >
      <Plus />
      Add image
    </Button>
  );
}
