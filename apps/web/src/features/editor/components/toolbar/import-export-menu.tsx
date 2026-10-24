import { Download, FileJson, Upload } from 'lucide-react';
import { useRef, type ChangeEvent } from 'react';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { useExportDraft } from '../../hooks/use-export-draft';
import { useImportFile } from '../../hooks/use-import-file';
import { type ImportFailure } from '../../utils/utils';
import { useEditorHasErrors } from '../editor-store-provider';

/** `onImportError` receives null after a successful import. */
export function ImportExportMenu({
  onImportError,
}: {
  onImportError: (error: ImportFailure | null) => void;
}) {
  const hasErrors = useEditorHasErrors();

  const exportDraft = useExportDraft();
  const importFile = useImportFile({ onImportError });

  const fileInput = useRef<HTMLInputElement>(null);

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
