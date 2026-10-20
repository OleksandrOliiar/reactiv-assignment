import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useEditorActions } from './editor-store-provider';
import { DeleteSectionDialog } from './delete-section-dialog';

export function SectionMenu({
  sectionId,
  title,
  index,
  count,
}: {
  sectionId: string;
  title: string;
  index: number;
  count: number;
}) {
  const { moveSection, duplicateSection } = useEditorActions();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Actions for ${title}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={index === 0} onSelect={() => moveSection(sectionId, 'up')}>
            <ArrowUp />
            Move up
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={index === count - 1}
            onSelect={() => moveSection(sectionId, 'down')}
          >
            <ArrowDown />
            Move down
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => duplicateSection(sectionId)}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmingDelete(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteSectionDialog
        sectionId={sectionId}
        title={title}
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
      />
    </>
  );
}
