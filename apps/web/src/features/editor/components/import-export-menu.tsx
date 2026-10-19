'use client';

import { Download, FileJson, Upload } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { useEditorActions, useEditorStoreApi, useEditorValidation } from './editor-store-provider';
import {
  createExportFile,
  downloadExport,
  INVALID_JSON,
  isImportTooLarge,
  parseImportText,
  type ImportFailure,
} from '../utils/utils';

export function ImportExportMenu({
  onFailure,
  onImported,
}: {
  onFailure: (error: ImportFailure) => void;
  onImported: () => void;
}) {
  const store = useEditorStoreApi();
  const { replaceDocument } = useEditorActions();

  const fileInput = useRef<HTMLInputElement>(null);

  const isInvalid = Object.keys(useEditorValidation()).length > 0;

  function exportDraft() {
    const file = createExportFile(store.getState().state.document);
    if (!file) return;
    downloadExport(file);
    toast.success('Exported the home screen');
  }

  async function importFile(file: File) {
    const isOversized = isImportTooLarge(file.size);
    if (isOversized) {
      onFailure(isOversized);
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      onFailure({ status: 'invalid_json', message: INVALID_JSON });
      return;
    }

    const result = parseImportText(text);
    if (result.status !== 'imported') {
      onFailure(result);
      return;
    }

    replaceDocument(result.data);
    onImported();
    toast.success('Imported the home screen. Save to keep it.');
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file) void importFile(file);
  }

  function handleImportClick() {
    const input = fileInput.current;
    if (!input) return;
    input.value = '';
    input.click();
  }

  return (
    <>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        aria-label="Import home screen JSON"
        onChange={handleInputChange}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline">
            <FileJson />
            File
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={isInvalid} onSelect={exportDraft}>
            <Download />
            Export JSON
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleImportClick}>
            <Upload />
            Import JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
