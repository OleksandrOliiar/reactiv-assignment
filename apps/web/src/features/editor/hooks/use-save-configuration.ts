'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { loadLatestConfiguration, saveConfiguration } from '@/features/editor/api/actions';
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
  const errors = useEditorValidation();
  const invalid = Object.keys(errors).length > 0;
  const [conflictOpen, setConflictOpen] = useState(false);

  function apply(result: SaveResult) {
    if (result.status === 'saved') {
      markSaved(result.configuration);
      setConflictOpen(false);
      toast.success('Home screen saved');
      return;
    }
    if (result.status === 'conflict') {
      setConflictOpen(true);
      return;
    }
    if (result.status === 'invalid') {
      setServerErrors(result.errors);
      toast.error(result.message);
      return;
    }
    markForCreate();
    toast.error('The saved screen no longer exists. Save again to create it.');
  }

  const save = useMutation({
    mutationFn: () => saveConfiguration(currentInput()),
    onSuccess: apply,
    onError: unavailable,
  });

  const reload = useMutation({
    mutationFn: () => loadLatestConfiguration(store.getState().state.id),
    onSuccess(result) {
      if (result.status === 'missing') {
        markForCreate();
        toast.error('The saved screen no longer exists.');
      } else {
        replaceFromServer({ configuration: result.configuration, isNew: false });
        toast.success('Loaded the latest saved screen');
      }
      setConflictOpen(false);
    },
    onError: unavailable,
  });

  const overwrite = useMutation({
    mutationFn: async () => {
      const latest = await loadLatestConfiguration(store.getState().state.id);
      const { id, data } = currentInput();
      if (latest.status === 'missing') {
        return saveConfiguration({ id, version: 1, isNew: true, data });
      }
      return saveConfiguration({
        id,
        version: latest.configuration.version,
        isNew: false,
        data,
      });
    },
    onSuccess: apply,
    onError: unavailable,
  });

  const pending = save.isPending || reload.isPending || overwrite.isPending;

  function currentInput() {
    const { id, version, isNew: creating, document } = store.getState().state;
    return { id, version, isNew: creating, data: document };
  }

  return {
    conflictOpen,
    setConflictOpen,
    pending,
    disabled: pending || invalid || (!dirty && !isNew),
    saveDraft() {
      if (invalid) {
        toast.error('Fix the highlighted fields before saving.');
        return;
      }
      save.mutate();
    },
    reloadLatest() {
      reload.mutate();
    },
    overwrite() {
      overwrite.mutate();
    },
  };
}

function unavailable() {
  toast.error('The configuration service is unavailable.');
}
