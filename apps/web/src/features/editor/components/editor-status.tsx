import { Badge } from '@/shared/ui/badge';
import {
  useEditorIsDirty,
  useEditorValidation,
  useEditorVersion,
  useEditorIsNew,
} from './editor-store-provider';

function statusLabel(isNew: boolean, dirty: boolean): string {
  if (dirty) return 'Unsaved changes';
  if (isNew) return 'Not saved yet';
  return 'Saved';
}

export function EditorStatus() {
  const version = useEditorVersion();
  const isNew = useEditorIsNew();
  const dirty = useEditorIsDirty();
  const errors = useEditorValidation();
  const errorCount = Object.values(errors).reduce(
    (count, fields) => count + Object.keys(fields).length,
    0,
  );

  return (
    <>
      <Badge variant={dirty || isNew ? 'secondary' : 'default'}>{statusLabel(isNew, dirty)}</Badge>
      {isNew ? null : <Badge variant="outline">Version {version}</Badge>}
      {errorCount > 0 ? (
        <Badge variant="destructive">
          {errorCount} {errorCount === 1 ? 'error' : 'errors'}
        </Badge>
      ) : null}
    </>
  );
}
