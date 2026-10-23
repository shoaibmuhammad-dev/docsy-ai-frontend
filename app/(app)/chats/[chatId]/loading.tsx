// Server Component
import { Skeleton } from '@/components/ui/Skeleton';

export default function ChatLoading() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-zinc-50">
      {/* Header skeleton */}
      <div className="h-14 border-b border-zinc-200 bg-white px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-48 h-5 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-24 h-8 rounded-xl" />
        </div>
      </div>

      {/* Body zones skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar skeleton */}
        <div className="hidden lg:flex flex-col w-72 border-r border-zinc-200 bg-white p-3 space-y-3">
          <Skeleton className="w-full h-9 rounded-xl" />
          <Skeleton className="w-full h-8 rounded-xl" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-12 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Center chat messages skeleton */}
        <div className="flex-1 flex flex-col p-6 space-y-4">
          <div className="flex justify-end">
            <Skeleton className="w-2/3 h-16 rounded-2xl" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="w-3/4 h-32 rounded-2xl" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="w-1/2 h-12 rounded-2xl" />
          </div>
        </div>

        {/* Right PDF viewer skeleton */}
        <div className="hidden lg:flex flex-col w-96 border-l border-zinc-200 bg-zinc-100 p-4 space-y-4 items-center">
          <Skeleton className="w-full h-8 rounded-xl" />
          <Skeleton className="w-80 h-[500px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
