'use client';

import { AlertCircleIcon, X } from 'lucide-react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';

import type { ImportFailure, ImportFailureStatus } from '../utils/utils';

const TITLES: Record<ImportFailureStatus, string> = {
  invalid_json: 'Could not read this file',
  unsupported_version: 'Unsupported file version',
  invalid_shape: 'This file is not a valid home screen',
  too_large: 'This file is too large',
};

export function ImportAlert({ error, onDismiss }: { error: ImportFailure; onDismiss: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{TITLES[error.status]}</AlertTitle>
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
