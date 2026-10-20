'use client';

import { LIMITS } from '@reactiv/contracts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { AddSectionMenu } from './add-section-menu';
import { useEditorIsDirty, useEditorSections } from './editor-store-provider';
import { EditorToolbar } from './editor-toolbar';
import { PhonePreview } from './phone-preview';
import { SectionList } from './section-list';
import { useUnsavedChangesWarning } from '../hooks/use-unsaved-changes-warning';
import { PanelHeading } from './panel-heading';

/**
 * Both panes stay mounted so each editor input renders once. On large screens
 * the tab list hides and the panes sit side by side.
 */
export function EditorScreen() {
  useUnsavedChangesWarning(useEditorIsDirty());
  const sectionCount = useEditorSections().length;

  return (
    <div className="flex flex-1 flex-col">
      <EditorToolbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 lg:py-8">
        <Tabs
          defaultValue="edit"
          className="gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-10"
        >
          <TabsList className="w-full lg:hidden">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent
            value="edit"
            forceMount
            className="flex flex-col gap-6 data-[state=inactive]:hidden lg:data-[state=inactive]:flex"
          >
            <PanelHeading
              title="Sections"
              meta={`${sectionCount} of ${LIMITS.sections}`}
              description="Click on a section to edit it. Drag the handle to reorder."
              action={<AddSectionMenu />}
            />
            <SectionList />
          </TabsContent>
          <TabsContent
            value="preview"
            forceMount
            className="flex flex-col gap-6 data-[state=inactive]:hidden lg:sticky lg:top-24 lg:data-[state=inactive]:flex"
          >
            <PanelHeading
              title="Live preview"
              description="Updates as you type."
              className="hidden lg:flex"
            />
            <PhonePreview />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
