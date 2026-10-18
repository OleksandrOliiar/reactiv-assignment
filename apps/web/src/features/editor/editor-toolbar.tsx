'use client';

import { Undo2 } from 'lucide-react';

import { AddSectionMenu } from '@/features/editor/add-section-menu';
import { useEditorStore, useIsDirty, useValidation } from '@/features/editor/editor-store-provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

export function EditorToolbar() {
  const version = useEditorStore((state) => state.version);
  const isNew = useEditorStore((state) => state.isNew);
  const discardChanges = useEditorStore((state) => state.discardChanges);
  const dirty = useIsDirty();
  const errors = useValidation();
  const errorCount = Object.values(errors).reduce(
    (count, fields) => count + Object.keys(fields).length,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home screen editor</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <Badge variant={dirty || isNew ? 'secondary' : 'default'}>
            {statusLabel(isNew, dirty)}
          </Badge>
          {isNew ? null : <Badge variant="outline">Version {version}</Badge>}
          {errorCount > 0 ? (
            <Badge variant="destructive">
              {errorCount} {errorCount === 1 ? 'error' : 'errors'}
            </Badge>
          ) : null}
        </CardDescription>
        <CardAction className="flex flex-wrap justify-end gap-2">
          <AddSectionMenu />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" disabled={!dirty}>
                <Undo2 />
                Discard
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  The editor goes back to the last saved version of the screen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={discardChanges}>
                  Discard
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardAction>
      </CardHeader>
    </Card>
  );
}

function statusLabel(isNew: boolean, dirty: boolean): string {
  if (dirty) return 'Unsaved changes';
  if (isNew) return 'Not saved yet';
  return 'Saved';
}
