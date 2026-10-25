import { useSortable } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useEditorActions } from '../editor-store-provider';

export function DragSectionButton({ sectionId, title }: { sectionId: string; title: string }) {
  const { moveSection } = useEditorActions();

  const { attributes, listeners, setActivatorNodeRef } = useSortable({
    id: sectionId,
  });

  /** Arrow keys move through the store; see `SectionList` for why dnd-kit's keyboard sensor is off. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    moveSection(sectionId, event.key === 'ArrowUp' ? 'up' : 'down');
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={setActivatorNodeRef}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative z-10 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${title}`}
          aria-roledescription="sortable"
          onKeyDown={handleKeyDown}
        >
          <GripVertical />
        </Button>
      </TooltipTrigger>

      <TooltipContent>Drag, or focus and press the up or down arrow key</TooltipContent>
    </Tooltip>
  );
}
