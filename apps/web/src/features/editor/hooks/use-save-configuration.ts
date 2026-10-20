import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  loadLatestConfiguration,
  overwriteConfiguration,
  saveConfiguration,
} from '@/features/editor/api/actions';
import type { SaveResult } from '@/features/editor/api/save-configuration';
import {
  useEditorActions,
  useEditorHasErrors,
  useEditorIsDirty,
  useEditorIsNew,
  useEditorStoreApi,
} from '@/features/editor/components/editor-store-provider';

export function useSaveConfiguration() {
  const store = useEditorStoreApi();
  const { markSaved, setServerErrors, markForCreate } = useEditorActions();
  const dirty = useEditorIsDirty();
  const isNew = useEditorIsNew();
  const hasErrors = useEditorHasErrors();
  const [conflictOpen, setConflictOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  /** Read at call time, so overwrite after a conflict sends the draft as it is now. */
  function currentInput() {
    const { state } = store.getState();
    return { id: state.id, version: state.version, isNew: state.isNew, data: state.document };
  }

  function apply(result: SaveResult) {
    switch (result.status) {
      case 'saved':
        markSaved(result.configuration);
        setConflictOpen(false);
        toast.success('Home screen saved');
        break;
      case 'conflict':
        setConflictOpen(true);
        break;
      case 'invalid':
        setServerErrors(result.errors);
        toast.error(result.message);
        break;
      case 'not_found':
        markForCreate();
        toast.error('The saved screen no longer exists. Save again to create it.');
        break;
    }
  }

  function run(task: () => Promise<void>) {
    startTransition(async () => {
      try {
        await task();
      } catch {
        toast.error('The configuration service is unavailable.');
      }
    });
  }

  function saveDraft() {
    run(async () => apply(await saveConfiguration(currentInput())));
  }

  function reloadLatest() {
    run(async () => {
      const latest = await loadLatestConfiguration(store.getState().state.id);
      setConflictOpen(false);
      if (!latest) {
        markForCreate();
        toast.error('The saved screen no longer exists.');
        return;
      }
      markSaved(latest);
      toast.success('Loaded the latest saved screen');
    });
  }

  function overwrite() {
    run(async () => apply(await overwriteConfiguration(currentInput())));
  }

  return {
    conflictOpen,
    setConflictOpen,
    pending,
    disabled: pending || hasErrors || (!dirty && !isNew),
    saveDraft,
    reloadLatest,
    overwrite,
  };
}
