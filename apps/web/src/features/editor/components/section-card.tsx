'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, GripVertical } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { useEditorActions, useEditorSelectedSectionId } from './editor-store-provider';
import { sectionTitle } from '../utils/utils';
import { DraftSection } from '../types/types';
import { SectionEditor, sectionRegistry } from './sections-registry';
import type { SectionErrors } from '../types/types';
import { SectionMenu } from './section-menu';

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

  const definition = sectionRegistry[section.type];
  const Icon = definition.icon;
  const errorCount = Object.keys(errors).length;
  const title = sectionTitle(section);

  return (
    <Collapsible
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn('rounded-lg border', isDragging && 'relative z-10 opacity-80 shadow-lg')}
      open={selected}
      onOpenChange={(open) => selectSection(open ? section.id : null)}
    >
      <div className="relative flex min-h-14 items-center gap-2 p-2">
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              'absolute inset-0 z-0 h-full w-full min-w-0 justify-start gap-2 pl-12 pr-12 text-left active:not-aria-[haspopup]:translate-y-0',
              selected ? 'rounded-t-md rounded-b-none' : 'rounded-md',
            )}
          >
            <Icon className="shrink-0" />
            <span className="truncate">
              {index + 1}. {title}
            </span>
            <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
              {definition.label}
            </Badge>
            {errorCount > 0 && (
              <Badge variant="destructive" className="shrink-0">
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </Badge>
            )}
            <ChevronDown
              className={cn('ml-auto shrink-0 transition-transform', selected && 'rotate-180')}
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
              className="relative z-10 shrink-0 cursor-grab touch-none active:cursor-grabbing"
              {...attributes}
              {...listeners}
              aria-label={`Reorder ${title}`}
              aria-roledescription="sortable"
              onKeyDown={(event) => {
                if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
                  return;
                }

                event.preventDefault();
                moveSection(section.id, event.key === 'ArrowUp' ? 'up' : 'down');
              }}
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
      <CollapsibleContent className="border-t p-4">
        <SectionEditor section={section} errors={errors} />
      </CollapsibleContent>
    </Collapsible>
  );
}
