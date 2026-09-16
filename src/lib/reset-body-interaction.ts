/**
 * Clears interaction-blocking styles that Radix overlays / scroll-lock can leave
 * on <body> after dialogs or route changes (common on mobile WebKit).
 */
export function resetBodyInteractionLock(): void {
  if (typeof document === "undefined") return;

  const { body, documentElement } = document;

  body.style.pointerEvents = "";
  body.style.overflow = "";
  body.style.paddingRight = "";
  body.style.removeProperty("touch-action");
  body.style.removeProperty("position");

  documentElement.style.overflow = "";
  documentElement.style.pointerEvents = "";
  documentElement.style.paddingRight = "";

  body.removeAttribute("data-scroll-locked");
  body.removeAttribute("data-radix-scroll-lock-scrollbar-size");
  documentElement.removeAttribute("data-scroll-locked");

  body.classList.remove("overflow-hidden");
}

/** Run unlock after Radix close animations / layout effects (mobile WebKit). */
export function scheduleBodyInteractionUnlock(): void {
  resetBodyInteractionLock();
  requestAnimationFrame(resetBodyInteractionLock);
  window.setTimeout(resetBodyInteractionLock, 100);
}
