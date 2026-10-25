import { Skeleton } from '@/shared/ui/skeleton';

export default function HomeLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-10 lg:py-8">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <div className="mx-auto hidden aspect-9/19 w-full max-w-84 animate-pulse rounded-phone bg-muted lg:block" />
      </div>
    </div>
  );
}
