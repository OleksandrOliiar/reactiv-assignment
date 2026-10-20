import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { DraftImage, SectionErrors } from '../types/types';
import { useEditorActions } from './editor-store-provider';
import { UrlField } from './fields';

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
  const { moveImage, removeImage, updateImage } = useEditorActions();

  return (
    <Card size="sm" className="bg-muted/40 shadow-none">
      <CardHeader className="items-center">
        <CardTitle className="text-muted-foreground">Image {index + 1}</CardTitle>
        <CardAction className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Move image up"
            disabled={index === 0}
            onClick={() => moveImage(sectionId, image.id, 'up')}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Move image down"
            disabled={isLastImage}
            onClick={() => moveImage(sectionId, image.id, 'down')}
          >
            <ChevronDown />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove image"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => removeImage(sectionId, image.id)}
          >
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <UrlField
          id={`${sectionId}-${image.id}-url`}
          label="Image URL"
          value={image.url}
          error={errors[`images.${index}.url`]}
          onChange={(url) => updateImage(sectionId, image.id, { url })}
        />
      </CardContent>
    </Card>
  );
}
