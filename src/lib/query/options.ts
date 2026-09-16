/** Default stale window for list/detail queries (tab navigation). */
export const LIST_QUERY_STALE_MS = 5 * 60 * 1000;

/**
 * Options for queries hydrated from a server component payload.
 * Prevents an immediate client refetch after RSC already fetched the same data.
 */
export function serverHydratedQueryOptions<T>(serverData: T) {
  return {
    initialData: serverData,
    initialDataUpdatedAt: Date.now(),
    staleTime: LIST_QUERY_STALE_MS,
    refetchOnMount: false as const,
    refetchOnWindowFocus: false as const,
    placeholderData: (previous: T | undefined) => previous ?? serverData,
  };
}

/** Keeps cached rows visible during background refetch / route transitions. */
export const keepPreviousData = <T>(previous: T | undefined) => previous;
