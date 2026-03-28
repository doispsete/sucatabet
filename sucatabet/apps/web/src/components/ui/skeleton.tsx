export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-[#131313] relative overflow-hidden rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#03D791]/10 before:to-transparent ${className}`} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`glass-card p-6 rounded-3xl space-y-4 ${className}`}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      <td colSpan={5} className="p-6">
        <SkeletonDivRow />
      </td>
    </tr>
  );
}

export function SkeletonDivRow({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-between p-6 ${className}`}>
      <div className="flex gap-4 items-center">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function SkeletonOperationRow() {
  return (
    <div className="grid grid-cols-12 items-center px-8 py-6 animate-pulse">
      <div className="col-span-4 lg:col-span-2 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16 opacity-40" />
      </div>
      <div className="col-span-4 lg:col-span-4 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="hidden lg:block col-span-2">
        <Skeleton className="h-6 w-20 rounded" />
      </div>
      <div className="col-span-4 lg:col-span-2 text-right flex justify-end">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="hidden lg:block col-span-2 text-right flex justify-end">
        <Skeleton className="h-3 w-16 opacity-20" />
      </div>
    </div>
  );
}
