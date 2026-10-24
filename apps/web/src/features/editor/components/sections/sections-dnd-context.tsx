import {
  Announcements,
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sectionTitle } from '../../utils/utils';
import { DraftSection } from '../../types/types';
import { useEditorActions } from '../editor-store-provider';
import { ReactNode } from 'react';

const SCREEN_READER_INSTRUCTIONS =
  'Press the up or down arrow key to move this section, or drag it with a pointer.';

function getAccessibilityAnnouncements(sections: DraftSection[]) {
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

  return announcements;
}

export function SectionsDndContext({
  sections,
  children,
}: {
  sections: DraftSection[];
  children: ReactNode;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const { reorderSection } = useEditorActions();

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) reorderSection(String(active.id), String(over.id));
  }

  return (
    <DndContext
      id="sections"
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{
        announcements: getAccessibilityAnnouncements(sections),
        screenReaderInstructions: { draggable: SCREEN_READER_INSTRUCTIONS },
      }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
