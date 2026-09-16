import { pageContainer, pageStack } from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className={cn(pageContainer, pageStack)}>
      <div className="overflow-hidden rounded-lg border border-border bg-surface lg:hidden">
        <div className="grid grid-cols-4 divide-x divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center px-1 py-2.5">
              <Skeleton className="h-5 w-6" />
              <Skeleton className="mt-1 h-2.5 w-10" />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden gap-4 lg:grid lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-12" />
          </div>
        ))}
      </div>

      <div>
        <Skeleton className="mb-2 h-3 w-24 lg:mb-3 lg:h-4 lg:w-28" />
        <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full lg:w-36" />
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <Skeleton className="mb-2 h-6 w-36 lg:mb-3 lg:h-5" />
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0"
              >
                <Skeleton className="h-4 w-[86px]" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16 lg:hidden" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="mb-2 h-3 w-28 lg:mb-3 lg:h-5 lg:w-36" />
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="space-y-2 border-b border-border p-3 last:border-b-0"
              >
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
