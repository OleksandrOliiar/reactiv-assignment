import { AlertCircleIcon, X } from 'lucide-react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';

import type { ImportFailure } from '../utils/utils';

export function ImportAlert({ error, onDismiss }: { error: ImportFailure; onDismiss: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{error.title}</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      <AlertAction>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X />
        </Button>
      </AlertAction>
    </Alert>
  );
}
