'use client';

import { Smartphone } from 'lucide-react';

import { Card, CardContent } from '@/shared/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { useEditorStore } from '../components/editor-store-provider';
import { SectionPreview } from './sections-registry';

export function PhonePreview() {
  const sections = useEditorStore((store) => store.state.document.sections);

  return (
    <Card
      aria-label="Phone preview"
      className="mx-auto aspect-9/19 w-full max-w-88 overflow-hidden rounded-[2.5rem] border-8 border-foreground py-0 ring-0"
    >
      <ScrollArea className="h-full">
        <CardContent className="flex flex-col gap-4 px-4 py-6">
          {sections.length === 0 ? (
            <NoSectionsMessage />
          ) : (
            sections.map((section) => <SectionPreview key={section.id} section={section} />)
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

function NoSectionsMessage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Smartphone />
        </EmptyMedia>
        <EmptyTitle>Empty screen</EmptyTitle>
        <EmptyDescription>Sections you add will appear here.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
