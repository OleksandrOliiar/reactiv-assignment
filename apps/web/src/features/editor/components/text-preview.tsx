import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

import type { SectionOf } from '../types/types';
import { safeHexColor } from '../utils/utils';

export function TextPreview({ section }: { section: SectionOf<'text'> }) {
  const titleColor = safeHexColor(section.title.color);
  const descriptionColor = safeHexColor(section.description.color);

  return (
    <Card className="shadow-xs">
      <CardHeader className="gap-1.5">
        <CardTitle
          className="text-lg leading-tight font-semibold"
          style={titleColor ? { color: titleColor } : undefined}
        >
          {section.title.text || 'Untitled'}
        </CardTitle>
        <CardDescription style={descriptionColor ? { color: descriptionColor } : undefined}>
          {section.description.text || 'No description'}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
