'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  GripVertical,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/shared/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { useEditorStore } from './editor-store-provider';
import { sectionTitle } from '../utils/utils';
import { DraftSection } from '../types/types';
import { SectionEditor, sectionRegistry } from './sections-registry';
import type { SectionErrors } from '../types/types';

type SectionCardProps = {
  section: DraftSection;
  index: number;
  count: number;
  errors: SectionErrors;
};

export function SectionCard({ section, index, count, errors }: SectionCardProps) {
  const selected = useEditorStore((store) => store.state.selectedSectionId === section.id);
  const selectSection = useEditorStore((store) => store.actions.selectSection);
  const moveSection = useEditorStore((store) => store.actions.moveSection);
  const duplicateSection = useEditorStore((store) => store.actions.duplicateSection);
  const removeSection = useEditorStore((store) => store.actions.removeSection);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
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
      open={selected}
      onOpenChange={(open) => selectSection(open ? section.id : null)}
      asChild
    >
      <Card
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={cn(isDragging && 'relative z-10 opacity-80 shadow-lg')}
      >
        <CardHeader>
          <CardTitle className="flex min-w-0 items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={setActivatorNodeRef}
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-grab touch-none active:cursor-grabbing"
                  {...attributes}
                  {...listeners}
                  aria-label={`Reorder ${title}`}
                  aria-roledescription="sortable"
                  onKeyDown={(event) => {
                    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                    event.preventDefault();
                    moveSection(section.id, event.key === 'ArrowUp' ? 'up' : 'down');
                  }}
                >
                  <GripVertical />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Drag, or focus and press the up or down arrow key</TooltipContent>
            </Tooltip>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="min-w-0 flex-1 justify-start">
                <Icon />
                <span className="truncate">
                  {index + 1}. {title}
                </span>
                <ChevronDown
                  className={cn('ml-auto transition-transform', selected && 'rotate-180')}
                />
              </Button>
            </CollapsibleTrigger>
          </CardTitle>
          <CardAction className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="hidden sm:inline-flex">
              {definition.label}
            </Badge>
            {errorCount > 0 ? (
              <Badge variant="destructive">
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </Badge>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${title}`}
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={index === 0}
                  onSelect={() => moveSection(section.id, 'up')}
                >
                  <ArrowUp />
                  Move up
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={index === count - 1}
                  onSelect={() => moveSection(section.id, 'down')}
                >
                  <ArrowDown />
                  Move down
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => duplicateSection(section.id)}>
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
          </CardAction>
        </CardHeader>
        <CollapsibleContent asChild>
          <CardContent>
            <SectionEditor section={section} errors={errors} />
          </CardContent>
        </CollapsibleContent>

        <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this section?</AlertDialogTitle>
              <AlertDialogDescription>
                {title} will be removed from the draft. Discard changes to bring it back before
                saving.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => removeSection(section.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </Collapsible>
  );
}
