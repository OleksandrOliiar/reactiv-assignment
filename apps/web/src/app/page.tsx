import { SmartphoneIcon } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';

export default function HomePage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SmartphoneIcon />
        </EmptyMedia>
        <EmptyTitle>Home screen editor</EmptyTitle>
        <EmptyDescription>
          The editor is being set up. Loading the saved home screen comes next.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
