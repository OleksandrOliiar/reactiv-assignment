import { Empty, EmptyMedia, EmptyHeader, EmptyDescription, EmptyTitle } from '@/shared/ui/empty';
import { httpUrlSchema } from '@reactiv/contracts';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';

export function SlideImage({ url, label }: { url: string; label: string }) {
  const [failed, setFailed] = useState(false);

  if (!httpUrlSchema.safeParse(url).success || failed) {
    return <ImageUnavailableMessage />;
  }

  return (
    // User-supplied remote URLs are not part of the Next.js image allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={label} className="size-full object-cover" onError={() => setFailed(true)} />
  );
}

function ImageUnavailableMessage() {
  return (
    <Empty className="h-full border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ImageOff />
        </EmptyMedia>
        <EmptyTitle>Image unavailable</EmptyTitle>
        <EmptyDescription>Use an http or https image URL.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
