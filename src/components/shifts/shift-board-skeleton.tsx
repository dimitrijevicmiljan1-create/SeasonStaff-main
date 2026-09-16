import { Skeleton } from "@/components/ui/skeleton";

export function ShiftBoardSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-3 lg:px-6">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
      <div className="flex-1 overflow-hidden p-3 lg:p-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex border-b border-border bg-surface p-3">
            <Skeleton className="mr-4 h-8 w-24" />
            <div className="flex flex-1 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-12" />
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={row} className="flex border-b border-border last:border-b-0">
              <Skeleton className="h-14 w-28 shrink-0 rounded-none" />
              <div className="flex flex-1">
                {Array.from({ length: 7 }).map((_, col) => (
                  <Skeleton
                    key={col}
                    className="h-14 min-w-[88px] flex-1 rounded-none"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
