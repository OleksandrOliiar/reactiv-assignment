import { toast } from 'sonner';
import { ImportFailure, readImportFile } from '../utils/utils';
import { useEditorActions } from '../components/editor-store-provider';

export function useImportFile({
  onImportError,
}: {
  onImportError: (error: ImportFailure | null) => void;
}) {
  const { replaceDocument } = useEditorActions();

  return async function (file: File) {
    const result = await readImportFile(file);

    if (!result.ok) {
      onImportError(result.error);
      return;
    }

    replaceDocument(result.data);
    onImportError(null);

    toast.success('Imported the home screen. Save to keep it.');
  };
}
