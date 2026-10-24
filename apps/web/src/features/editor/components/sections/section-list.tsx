import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LayoutList } from 'lucide-react';

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty';

import { useEditorSections, useEditorValidation } from '../editor-store-provider';
import { SectionCard } from './section-card';
import { SectionsDndContext } from './sections-dnd-context';

/**
 * Pointer dragging only. The handle moves one position per arrow key through
 * the store, because dnd-kit keyboard dragging skips over tall expanded cards.
 */
export function SectionList() {
  const sections = useEditorSections();
  const errors = useEditorValidation();

  if (sections.length === 0) {
    return <NoSectionsMessage />;
  }

  return (
    <SectionsDndContext sections={sections}>
      <SortableContext
        items={sections.map((section) => section.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              count={sections.length}
              errors={errors[section.id] ?? {}}
            />
          ))}
        </div>
      </SortableContext>
    </SectionsDndContext>
  );
}

function NoSectionsMessage() {
  return (
    <Empty className="border border-dashed bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LayoutList />
        </EmptyMedia>
        <EmptyTitle>No sections yet</EmptyTitle>
        <EmptyDescription>
          Use Add section to place a carousel, text block, or button on the screen.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
