import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';

import type { DraftSection, SectionErrors } from '../../types/types';
import { sectionTitle } from '../../utils/utils';
import { useEditorActions, useEditorSelectedSectionId } from '../editor-store-provider';
import { SectionMenu } from './section-menu';
import { SectionEditor, sectionRegistry } from './sections-registry';
import { DragSectionButton } from './drag-section-button';

type SectionCardProps = {
  section: DraftSection;
  index: number;
  count: number;
  errors: SectionErrors;
};

export function SectionCard({ section, index, count, errors }: SectionCardProps) {
  const selected = useEditorSelectedSectionId() === section.id;
  const { selectSection } = useEditorActions();

  const { setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

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
              'absolute inset-0 z-0 h-full w-full min-w-0 justify-start gap-3 pr-12 pl-11 text-left text-sm tracking-normal normal-case hover:bg-accent aria-expanded:bg-accent active:not-aria-[haspopup]:translate-y-0',
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
              <span className="font-mono text-[11px] font-normal tracking-wider text-muted-foreground uppercase">
                {definition.label}
              </span>
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
        <DragSectionButton sectionId={section.id} title={title} />
        <div className="relative z-10 ml-auto shrink-0">
          <SectionMenu sectionId={section.id} title={title} index={index} count={count} />
        </div>
      </div>
      <CollapsibleContent className="overflow-hidden border-t data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="px-4 py-5 sm:px-5">
          <SectionEditor section={section} errors={errors} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
