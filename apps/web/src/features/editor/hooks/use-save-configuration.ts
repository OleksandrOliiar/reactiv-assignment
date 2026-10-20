'use client';

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
  useEditorIsDirty,
  useEditorIsNew,
  useEditorStoreApi,
  useEditorValidation,
} from '@/features/editor/components/editor-store-provider';

export function useSaveConfiguration() {
  const store = useEditorStoreApi();
  const { markSaved, replaceFromServer, setServerErrors, markForCreate } = useEditorActions();
  const dirty = useEditorIsDirty();
  const isNew = useEditorIsNew();
  const invalid = Object.keys(useEditorValidation()).length > 0;
  const [conflictOpen, setConflictOpen] = useState(false);
  const [pending, startTransition] = useTransition();

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
    if (invalid) {
      toast.error('Fix the highlighted fields before saving.');
      return;
    }
    run(async () => apply(await saveConfiguration(currentInput())));
  }

  function reloadLatest() {
    run(async () => {
      const result = await loadLatestConfiguration(store.getState().state.id);
      setConflictOpen(false);
      if (result.status === 'missing') {
        markForCreate();
        toast.error('The saved screen no longer exists.');
        return;
      }
      replaceFromServer({ configuration: result.configuration, isNew: false });
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
    disabled: pending || invalid || (!dirty && !isNew),
    saveDraft,
    reloadLatest,
    overwrite,
  };
}
