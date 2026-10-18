'use client';

import { AlertCircleIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty';

export default function HomeError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircleIcon />
        </EmptyMedia>
        <EmptyTitle>Could not load the editor</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Alert variant="destructive">
          <AlertTitle>Configuration service unavailable</AlertTitle>
          <AlertDescription>Check that it is running, then try again.</AlertDescription>
        </Alert>
        <Button
          onClick={() => {
            retry();
          }}
          type="button"
        >
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
}
