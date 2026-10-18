import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { UrlField } from './fields';
import { Button } from '@/shared/ui/button';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useEditorStore } from './editor-store-provider';
import { DraftImage, SectionErrors } from '../types/types';

export function ImageCard({
  index,
  sectionId,
  image,
  errors,
  isLastImage,
}: {
  index: number;
  sectionId: string;
  image: DraftImage;
  errors: SectionErrors;
  isLastImage: boolean;
}) {
  const removeImage = useEditorStore((store) => store.actions.removeImage);
  const moveImage = useEditorStore((store) => store.actions.moveImage);
  const updateImage = useEditorStore((store) => store.actions.updateImage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image {index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <UrlField
          id={`${sectionId}-${image.id}-url`}
          label="Image URL"
          value={image.url}
          error={errors[`images.${index}.url`]}
          onChange={(url) =>
            updateImage(sectionId, image.id, (current) => ({
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
            onClick={() => moveImage(sectionId, image.id, 'up')}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Move image down"
            disabled={isLastImage}
            onClick={() => moveImage(sectionId, image.id, 'down')}
          >
            <ChevronDown />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Remove image"
            onClick={() => removeImage(sectionId, image.id)}
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
