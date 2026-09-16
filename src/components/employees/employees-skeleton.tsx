import { pageContainer, pageStack } from "@/lib/page-styles";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function EmployeesSkeleton() {
  return (
    <div className={cn(pageContainer, pageStack)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16" />
        ))}
      </div>
      <div className="space-y-3 lg:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="hidden h-64 w-full rounded-lg lg:block" />
    </div>
  );
}
