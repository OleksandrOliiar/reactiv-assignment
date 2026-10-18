'use client';

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

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';

import { AddSectionMenu } from '../components/add-section-menu';
import { sectionTitle } from '../utils/utils';
import { useEditorStore, useValidation } from '../components/editor-store-provider';
import { SectionCard } from '../components/section-card';

const SCREEN_READER_INSTRUCTIONS =
  'Press the up or down arrow key to move this section, or drag it with a pointer.';

/**
 * Pointer dragging only. The handle moves one position per arrow key through
 * the store, because dnd-kit keyboard dragging skips over tall expanded cards.
 */
export function SectionList() {
  const sections = useEditorStore((store) => store.state.document.sections);
  const reorderSection = useEditorStore((store) => store.actions.reorderSection);
  const errors = useValidation();
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
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutList />
          </EmptyMedia>
          <EmptyTitle>No sections yet</EmptyTitle>
          <EmptyDescription>
            Add a carousel, text block, or button to build the screen.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AddSectionMenu />
        </EmptyContent>
      </Empty>
    );
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
