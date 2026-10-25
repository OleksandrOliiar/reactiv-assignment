import { BatteryFull, Signal, Smartphone, Wifi } from 'lucide-react';

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty';
import { ScrollArea } from '@/shared/ui/scroll-area';

import { useEditorSections } from '../editor-store-provider';
import { SectionPreview } from './preview-registry';

export function PhonePreview() {
  const sections = useEditorSections();

  return (
    <div
      role="region"
      aria-label="Phone preview"
      className="mx-auto flex aspect-9/19 w-full max-w-84 flex-col overflow-hidden rounded-phone bg-muted p-2.5 shadow-2xl shadow-background/60 ring-1 ring-foreground/25"
    >
      <div className="light relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[calc(var(--radius-phone)-var(--spacing)*2.5)] bg-background text-foreground">
        <StatusBar />
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 px-4 pt-2 pb-10">
            {sections.length === 0 ? (
              <NoSectionsMessage />
            ) : (
              sections.map((section) => <SectionPreview key={section.id} section={section} />)
            )}
          </div>
        </ScrollArea>
        <span
          aria-hidden
          className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-foreground/70"
        />
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div
      aria-hidden
      className="relative flex h-11 shrink-0 items-center justify-between px-7 text-xs font-semibold"
    >
      <span className="tabular-nums">9:41</span>
      <span className="absolute top-2.5 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-foreground" />
      <span className="flex items-center gap-1">
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-4" />
      </span>
    </div>
  );
}

function NoSectionsMessage() {
  return (
    <Empty className="mt-16">
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
