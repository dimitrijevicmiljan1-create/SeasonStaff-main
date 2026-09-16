"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { resetBodyInteractionLock } from "@/lib/reset-body-interaction";

/**
 * Ensures no global scroll/pointer lock survives route changes on mobile.
 */
export function BodyInteractionReset() {
  const pathname = usePathname();

  useEffect(() => {
    resetBodyInteractionLock();
  }, [pathname]);

  useEffect(() => {
    resetBodyInteractionLock();

    const onPageShow = () => resetBodyInteractionLock();
    window.addEventListener("pageshow", onPageShow);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetBodyInteractionLock();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
