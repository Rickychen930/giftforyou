/**
 * Custom hook for locking/unlocking body scroll
 * Reusable utility following DRY principle
 */

import { useEffect } from "react";

/**
 * Hook to lock body scroll when modal/overlay is open
 * Automatically handles cleanup on unmount
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    // Save current scroll position and styles
    const scrollY = window.scrollY;
    const bodyStyle = window.getComputedStyle(document.body);
    const prevOverflow = bodyStyle.overflow;
    const prevPosition = bodyStyle.position;
    const prevWidth = bodyStyle.width;
    const prevTop = bodyStyle.top;

    // Lock scroll
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    // Cleanup function
    return () => {
      // Restore previous styles
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.width = prevWidth;
      document.body.style.top = prevTop;

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isLocked]);
}

