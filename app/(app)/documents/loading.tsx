// Server Component
import { Skeleton } from '@/components/ui/Skeleton';

export default function DocumentsLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* Row skeletons */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
