"use client";

import { AppLink } from "@/components/ui/app-link";

import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  shortLabel?: string;
  value: number;
  href?: string;
}

interface StatsRowProps {
  items: StatItem[];
}

function StatCell({ label, value, href }: StatItem) {
  const content = (
    <>
      <p className="tabular-nums text-lg font-semibold leading-none text-text-primary lg:text-xl">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium leading-tight text-text-secondary lg:text-xs">
        <span className="lg:hidden">{label.split(" ")[0]}</span>
        <span className="hidden lg:inline">{label}</span>
      </p>
    </>
  );

  const className = cn(
    "flex flex-col items-center justify-center px-1 py-2.5 text-center transition-colors lg:items-start lg:p-4 lg:text-left",
    href && "cursor-pointer hover:bg-subtle",
  );

  if (href) {
    return (
      <AppLink href={href} className={className} aria-label={`${label}, ${value}`}>
        {content}
      </AppLink>
    );
  }

  return <div className={className}>{content}</div>;
}

export function StatsRow({ items }: StatsRowProps) {
  return (
    <>
      {/* Mobile: single compact strip */}
      <section
        aria-label="Quick stats"
        className="overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] lg:hidden"
      >
        <div className="grid grid-cols-4 divide-x divide-border">
          {items.map((item) => (
            <StatCell key={item.label} {...item} />
          ))}
        </div>
      </section>

      {/* Desktop: individual cards */}
      <section
        aria-label="Quick stats"
        className="hidden gap-4 lg:grid lg:grid-cols-4"
      >
        {items.map((item) => {
          const className = cn(
            "rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-colors",
            item.href && "cursor-pointer hover:bg-subtle",
          );
          const inner = (
            <>
              <p className="text-xs font-medium text-text-secondary">
                {item.label}
              </p>
              <p className="mt-1.5 tabular-nums text-2xl font-semibold tracking-tight text-text-primary">
                {item.value}
              </p>
            </>
          );

          if (item.href) {
            return (
              <AppLink
                key={item.label}
                href={item.href}
                className={className}
                aria-label={`${item.label}, ${item.value}`}
              >
                {inner}
              </AppLink>
            );
          }

          return (
            <div key={item.label} className={className}>
              {inner}
            </div>
          );
        })}
      </section>
    </>
  );
}
