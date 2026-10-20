'use client';

import { Smartphone } from 'lucide-react';
import { useState } from 'react';

import { DiscardChangesDialog } from './discard-changes-dialog';
import { EditorStatus } from './editor-status';
import { ImportAlert } from './import-alert';
import { ImportExportMenu } from './import-export-menu';
import { SaveButton } from './save-button';
import type { ImportFailure } from '../utils/utils';

/**
 * Phones get two rows: title and Save, then the secondary actions stretched
 * across the width. From `sm` up everything sits on one row.
 */
export function EditorToolbar() {
  const [importError, setImportError] = useState<ImportFailure | null>(null);

  return (
    <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:flex-nowrap sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Smartphone className="size-4.5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="truncate text-base leading-tight font-semibold tracking-tight">
              Home screen editor
            </h1>
            <EditorStatus />
          </div>
        </div>

        <div className="order-last flex w-full items-center gap-2 sm:order-0 sm:w-auto [&>button]:flex-auto sm:[&>button]:flex-none">
          <ImportExportMenu onFailure={setImportError} onImported={() => setImportError(null)} />
          <DiscardChangesDialog />
        </div>

        <div className="flex shrink-0 items-center sm:border-l sm:pl-3">
          <SaveButton />
        </div>
      </div>

      {importError ? (
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <ImportAlert error={importError} onDismiss={() => setImportError(null)} />
        </div>
      ) : null}
    </header>
  );
}
