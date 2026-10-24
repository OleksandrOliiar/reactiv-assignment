import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, GripVertical } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import type { DraftSection, SectionErrors } from '../../types/types';
import { sectionTitle } from '../../utils/utils';
import { useEditorActions, useEditorSelectedSectionId } from '../editor-store-provider';
import { SectionMenu } from './section-menu';
import { SectionEditor, sectionRegistry } from './sections-registry';

type SectionCardProps = {
  section: DraftSection;
  index: number;
  count: number;
  errors: SectionErrors;
};

export function SectionCard({ section, index, count, errors }: SectionCardProps) {
  const selected = useEditorSelectedSectionId() === section.id;
  const { moveSection, selectSection } = useEditorActions();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  /** Arrow keys move through the store; see `SectionList` for why dnd-kit's keyboard sensor is off. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    moveSection(section.id, event.key === 'ArrowUp' ? 'up' : 'down');
  }

  const definition = sectionRegistry[section.type];
  const Icon = definition.icon;
  const errorCount = Object.keys(errors).length;
  const title = sectionTitle(section);

  return (
    <Collapsible
      ref={setNodeRef}
      style={{
        // The drag transform also scales this card to the one under the pointer.
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(
        'group rounded-xl border bg-card shadow-xs transition-[border-color,box-shadow]',
        selected ? 'border-primary/30 shadow-sm' : 'hover:border-primary/25 hover:shadow-sm',
        errorCount > 0 && !selected && 'border-destructive/40',
        isDragging && 'relative z-10 opacity-90 shadow-lg',
      )}
      open={selected}
      onOpenChange={(open) => selectSection(open ? section.id : null)}
    >
      {/* The trigger covers the whole row so any click toggles the card. Buttons cannot nest,
          so the drag handle and the menu are siblings layered above it with z-10. */}
      <div className="relative flex min-h-16 items-center gap-2 p-2">
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              'absolute inset-0 z-0 h-full w-full min-w-0 justify-start gap-3 pr-12 pl-11 text-left hover:bg-accent/50 aria-expanded:bg-accent/40 active:not-aria-[haspopup]:translate-y-0',
              selected ? 'rounded-t-xl rounded-b-none' : 'rounded-xl',
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                selected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground',
              )}
            >
              <Icon />
            </span>
            <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
              <span className="w-full truncate font-medium">
                <span className="text-muted-foreground tabular-nums">{`${index + 1}.`}</span>{' '}
                {title}
              </span>{' '}
              <span className="text-xs font-normal text-muted-foreground">{definition.label}</span>
            </span>
            {errorCount > 0 && (
              <Badge variant="destructive" className="shrink-0">
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'shrink-0 text-muted-foreground transition-transform',
                selected && 'rotate-180 text-foreground',
              )}
            />
          </Button>
        </CollapsibleTrigger>
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
        <div className="relative z-10 ml-auto shrink-0">
          <SectionMenu sectionId={section.id} title={title} index={index} count={count} />
        </div>
      </div>
      <CollapsibleContent className="border-t px-4 py-5 sm:px-5">
        <SectionEditor section={section} errors={errors} />
      </CollapsibleContent>
    </Collapsible>
  );
}
