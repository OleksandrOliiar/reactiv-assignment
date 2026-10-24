import { toast } from 'sonner';
import { createExportFile, downloadExport } from '../utils/utils';
import { useEditorStoreApi } from '../components/editor-store-provider';

export function useExportDraft() {
  const store = useEditorStoreApi();

  return function () {
    const file = createExportFile(store.getState().state.document);
    if (!file) return;
    downloadExport(file);
    toast.success('Exported the home screen');
  };
}
