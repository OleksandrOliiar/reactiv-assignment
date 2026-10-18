'use client';

import { Save } from 'lucide-react';

import { useSaveConfiguration } from '@/features/editor/hooks/use-save-configuration';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import { SaveConflictDialog } from './save-conflict-dialog';

export function SaveButton() {
  const save = useSaveConfiguration();

  return (
    <>
      <Button type="button" disabled={save.disabled} onClick={save.saveDraft}>
        {save.pending ? <Spinner /> : <Save />}
        Save
      </Button>
      <SaveConflictDialog
        open={save.conflictOpen}
        pending={save.pending}
        onOpenChange={save.setConflictOpen}
        onReload={save.reloadLatest}
        onOverwrite={save.overwrite}
      />
    </>
  );
}
