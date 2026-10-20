import { Download, FileJson, Upload } from 'lucide-react';
import { useRef, type ChangeEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { useEditorActions, useEditorHasErrors, useEditorStoreApi } from './editor-store-provider';
import {
  createExportFile,
  downloadExport,
  readImportFile,
  type ImportFailure,
} from '../utils/utils';

/** `onImportError` receives null after a successful import. */
export function ImportExportMenu({
  onImportError,
}: {
  onImportError: (error: ImportFailure | null) => void;
}) {
  const store = useEditorStoreApi();
  const { replaceDocument } = useEditorActions();
  const hasErrors = useEditorHasErrors();
  const fileInput = useRef<HTMLInputElement>(null);

  function exportDraft() {
    const file = createExportFile(store.getState().state.document);
    if (!file) return;
    downloadExport(file);
    toast.success('Exported the home screen');
  }

  async function importFile(file: File) {
    const result = await readImportFile(file);
    if (!result.ok) {
      onImportError(result.error);
      return;
    }
    replaceDocument(result.data);
    onImportError(null);
    toast.success('Imported the home screen. Save to keep it.');
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    // Cleared so picking the same file again still fires `change`.
    event.currentTarget.value = '';
    if (file) void importFile(file);
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
          <DropdownMenuItem disabled={hasErrors} onSelect={exportDraft}>
            <Download />
            Export JSON
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileInput.current?.click()}>
            <Upload />
            Import JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
