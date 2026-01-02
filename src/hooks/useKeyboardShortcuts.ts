/**
 * Custom hook for keyboard shortcuts
 * Reusable utility following DRY principle
 */

import { useEffect } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts
 * Automatically handles cleanup on unmount
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[]
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keyMatch = event.key === shortcut.key;
        const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;
        const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey;

        // Check if target is an input/textarea/contenteditable
        const target = event.target as HTMLElement;
        const isInputElement =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          // Only prevent default if not in input element (unless explicitly allowed)
          if (!isInputElement) {
            event.preventDefault();
          }
          shortcut.handler(event);
          break; // Only handle first matching shortcut
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
}

