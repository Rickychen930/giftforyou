// Keyboard shortcuts utility for luxury UX

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
}

class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private enabled: boolean = true;

  register(shortcut: KeyboardShortcut): () => void {
    const id = this.getShortcutId(shortcut);
    this.shortcuts.set(id, shortcut);

    return () => {
      this.shortcuts.delete(id);
    };
  }

  private getShortcutId(shortcut: KeyboardShortcut): string {
    const modifiers: string[] = [];
    if (shortcut.ctrl) modifiers.push("ctrl");
    if (shortcut.shift) modifiers.push("shift");
    if (shortcut.alt) modifiers.push("alt");
    if (shortcut.meta) modifiers.push("meta");
    return `${modifiers.join("+")}+${shortcut.key.toLowerCase()}`;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    // Handle undefined key
    if (!event.key) return;

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Don't trigger if user is typing in input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of this.shortcuts.values()) {
      if (
        shortcut.key.toLowerCase() === key &&
        (shortcut.ctrl || shortcut.meta ? ctrl : !ctrl && !event.metaKey) &&
        (shortcut.shift ? shift : !shift) &&
        (shortcut.alt ? alt : !alt)
      ) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}

// Global instance
export const keyboardShortcuts = new KeyboardShortcutsManager();

// Initialize on mount
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => keyboardShortcuts.handleKeyDown(e));
}

