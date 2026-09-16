/** Shared layout & typography tokens — do not change structure, only visual rhythm */
export const pageContainer =
  "mx-auto w-full max-w-[1200px] px-4 py-4 lg:px-6 lg:py-6";

export const pageStack = "flex flex-col gap-5 lg:gap-6";

export const sectionTitle =
  "text-sm font-semibold tracking-tight text-text-primary";

export const sectionEyebrow =
  "text-[11px] font-semibold uppercase tracking-wider text-text-tertiary";

export const sectionHeaderRow = "mb-3 flex items-end justify-between gap-3";

export const listMeta = "text-xs font-medium text-text-secondary";

export const filterPillBase =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors lg:text-sm";

export const filterPillActive =
  "border-accent bg-accent-subtle text-accent";

export const filterPillInactive =
  "border-border bg-surface text-text-secondary hover:border-border-strong hover:bg-subtle hover:text-text-primary";

export const emptyStateBox =
  "flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-border bg-surface px-6 py-10 text-center";
