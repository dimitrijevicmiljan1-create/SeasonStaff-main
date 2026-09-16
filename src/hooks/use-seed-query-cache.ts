"use client";

import { useRef } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

interface CacheSeed {
  queryKey: QueryKey;
  data: unknown;
}

/**
 * Seeds React Query cache from server-fetched props when the key is empty.
 * Avoids a duplicate client fetch after visiting a page that already loaded RSC data.
 */
export function useSeedQueryCache(seeds: CacheSeed[]): void {
  const queryClient = useQueryClient();
  const seeded = useRef(false);

  if (!seeded.current) {
    const updatedAt = Date.now();

    for (const { queryKey, data } of seeds) {
      const existing = queryClient.getQueryState(queryKey);
      if (existing?.data === undefined) {
        queryClient.setQueryData(queryKey, data, { updatedAt });
      }
    }

    seeded.current = true;
  }
}
