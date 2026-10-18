'use client';

import { useIsDirty } from '@/features/editor/editor-store-provider';
import { EditorToolbar } from '@/features/editor/editor-toolbar';
import { PhonePreview } from '@/features/editor/phone-preview';
import { SectionList } from '@/features/editor/section-list';
import { useUnsavedChangesWarning } from '@/features/editor/use-unsaved-changes-warning';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

/**
 * Both panes stay mounted so each editor input renders once. On large screens
 * the tab list hides and the panes sit side by side.
 */
export function EditorScreen() {
  useUnsavedChangesWarning(useIsDirty());

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
      <EditorToolbar />

      <Tabs
        defaultValue="edit"
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8"
      >
        <TabsList className="w-full lg:hidden">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent
          value="edit"
          forceMount
          className="data-[state=inactive]:hidden lg:data-[state=inactive]:block"
        >
          <SectionList />
        </TabsContent>
        <TabsContent
          value="preview"
          forceMount
          className="data-[state=inactive]:hidden lg:sticky lg:top-6 lg:data-[state=inactive]:block"
        >
          <PhonePreview />
        </TabsContent>
      </Tabs>
    </main>
  );
}
