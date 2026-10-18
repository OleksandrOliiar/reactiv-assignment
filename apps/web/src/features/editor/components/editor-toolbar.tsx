'use client';

import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

import { AddSectionMenu } from './add-section-menu';
import { DiscardChangesDialog } from './discard-changes-dialog';
import { EditorStatus } from './editor-status';

export function EditorToolbar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Home screen editor</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <EditorStatus />
        </CardDescription>
        <CardAction className="flex flex-wrap justify-end gap-2">
          <AddSectionMenu />
          <DiscardChangesDialog />
        </CardAction>
      </CardHeader>
    </Card>
  );
}