'use client';

import { useState } from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

import { AddSectionMenu } from './add-section-menu';
import { DiscardChangesDialog } from './discard-changes-dialog';
import { EditorStatus } from './editor-status';
import { ImportAlert } from './import-alert';
import { ImportExportMenu } from './import-export-menu';
import { SaveButton } from './save-button';
import type { ImportFailure } from '../utils/utils';

export function EditorToolbar() {
  const [importError, setImportError] = useState<ImportFailure | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home screen editor</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <EditorStatus />
        </CardDescription>
        <CardAction className="flex flex-wrap justify-end gap-2">
          <ImportExportMenu onFailure={setImportError} onImported={() => setImportError(null)} />
          <AddSectionMenu />
          <DiscardChangesDialog />
          <SaveButton />
        </CardAction>
      </CardHeader>
      {importError ? (
        <CardContent>
          <ImportAlert error={importError} onDismiss={() => setImportError(null)} />
        </CardContent>
      ) : null}
    </Card>
  );
}
