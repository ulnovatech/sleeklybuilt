import { Skeleton } from '@/components/ui/primitives';

export default function Loading() {
  return (
    <div className="space-y-5" aria-label="Loading workspace">
      <div className="border-b border-line pb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28" />)}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
