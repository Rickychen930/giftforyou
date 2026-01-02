/**
 * Click Outside Utilities
 * Reusable utilities for class components to handle click outside events
 * Following DRY principle
 */

/**
 * Setup click outside listener for class components
 * Returns cleanup function
 */
export function setupClickOutside(
  element: HTMLElement | null,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): (() => void) | null {
  if (!element || !enabled) return null;

  const listener = (event: MouseEvent | TouchEvent): void => {
    const target = event.target as Node;
    if (!element.contains(target)) {
      handler(event);
    }
  };

  // Use capture phase for better mobile support
  document.addEventListener("mousedown", listener, true);
  document.addEventListener("touchstart", listener, { passive: true, capture: true });

  // Return cleanup function
  return () => {
    document.removeEventListener("mousedown", listener, true);
    document.removeEventListener("touchstart", listener, true);
  };
}

