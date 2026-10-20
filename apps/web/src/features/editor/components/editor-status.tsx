import { cn } from '@/shared/lib/utils';
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
    <div
      aria-live="polite"
      className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-medium',
          dirty ? 'text-amber-700' : isNew ? 'text-foreground' : 'text-emerald-700',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'size-1.5 rounded-full',
            dirty ? 'bg-amber-500' : isNew ? 'bg-muted-foreground' : 'bg-emerald-500',
          )}
        />
        <span>{statusLabel(isNew, dirty)}</span>
      </span>
      {isNew ? null : (
        <>
          <span aria-hidden className="text-border">
            |
          </span>
          <span className="tabular-nums">Version {version}</span>
        </>
      )}
      {errorCount > 0 ? (
        <Badge variant="destructive" className="h-4.5 px-1.5">
          {errorCount} {errorCount === 1 ? 'error' : 'errors'}
        </Badge>
      ) : null}
    </div>
  );
}
