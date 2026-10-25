import { httpUrlSchema } from '@reactiv/contracts';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';

import type { SectionOf } from '../../types/types';
import { safeHexColor } from '../../utils/utils';

export function CtaPreview({ section }: { section: SectionOf<'cta'> }) {
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
        <Button asChild size="cta" style={style}>
          <a href={section.url} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        </Button>
      ) : (
        <>
          <Button type="button" size="cta" style={style}>
            {label}
          </Button>
          <Alert className="text-xs">
            <AlertDescription className="text-xs">
              Enter an http or https URL before this button can open.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
