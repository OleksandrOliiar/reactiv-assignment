import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LayoutList } from 'lucide-react';

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty';

import { sectionTitle } from '../../utils/utils';
import { useEditorActions, useEditorSections, useEditorValidation } from '../editor-store-provider';
import { SectionCard } from './section-card';

const SCREEN_READER_INSTRUCTIONS =
  'Press the up or down arrow key to move this section, or drag it with a pointer.';

/**
 * Pointer dragging only. The handle moves one position per arrow key through
 * the store, because dnd-kit keyboard dragging skips over tall expanded cards.
 */
export function SectionList() {
  const sections = useEditorSections();
  const { reorderSection } = useEditorActions();
  const errors = useEditorValidation();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function titleOf(id: UniqueIdentifier | undefined): string {
    const section = sections.find((candidate) => candidate.id === id);
    return section ? sectionTitle(section) : 'section';
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${titleOf(active.id)} is over ${titleOf(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${titleOf(active.id)} was dropped at the position of ${titleOf(over.id)}.`
        : undefined,
    onDragCancel: ({ active }) => `Moving ${titleOf(active.id)} was cancelled.`,
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) reorderSection(String(active.id), String(over.id));
  }

  if (sections.length === 0) {
    return <NoSectionsMessage />;
  }

  return (
    <DndContext
      id="sections"
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: SCREEN_READER_INSTRUCTIONS },
      }}
      onDragEnd={handleDragEnd}
    >
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
    </DndContext>
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
