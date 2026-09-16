/** When true, business data is served from local demo fixtures instead of Supabase. */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
