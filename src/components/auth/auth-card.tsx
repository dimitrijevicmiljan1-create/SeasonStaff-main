import type { ReactNode } from "react";

import { SeasonStaffLogo } from "@/components/brand/seasonstaff-logo";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 sm:py-16",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <SeasonStaffLogo href={null} size={40} />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-text-secondary">{description}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        {children}
      </div>

      {footer ? (
        <div className="text-center text-sm text-text-secondary">{footer}</div>
      ) : null}
    </div>
  );
}
