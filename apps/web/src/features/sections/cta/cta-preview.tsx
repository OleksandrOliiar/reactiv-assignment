'use client';

import { httpUrlSchema } from '@reactiv/contracts';

import type { DraftSection } from '@/features/editor/draft';
import { safeHexColor } from '@/features/sections/values';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';

export function CtaPreview({ section }: { section: Extract<DraftSection, { type: 'cta' }> }) {
  const buttonColor = safeHexColor(section.buttonColor);
  const labelColor = safeHexColor(section.labelColor);
  const style = {
    ...(buttonColor ? { backgroundColor: buttonColor } : {}),
    ...(labelColor ? { color: labelColor } : {}),
  };
  const label = section.label || 'Button';

  return (
    <div className="flex flex-col gap-2">
      {httpUrlSchema.safeParse(section.url).success ? (
        <Button asChild style={style}>
          <a href={section.url} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        </Button>
      ) : (
        <>
          <Button type="button" style={style}>
            {label}
          </Button>
          <Alert>
            <AlertDescription>
              Enter an http or https URL before this button can open.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
