'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import type { DraftSection } from '../types/types';
import { safeHexColor } from '../utils/utils';

export function TextPreview({ section }: { section: Extract<DraftSection, { type: 'text' }> }) {
  const titleColor = safeHexColor(section.title.color);
  const descriptionColor = safeHexColor(section.description.color);

  return (
    <Card>
      <CardHeader>
        <CardTitle style={titleColor ? { color: titleColor } : undefined}>
          {section.title.text || 'Untitled'}
        </CardTitle>
        <CardDescription style={descriptionColor ? { color: descriptionColor } : undefined}>
          {section.description.text || 'No description'}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
