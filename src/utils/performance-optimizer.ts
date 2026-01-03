/**
 * Performance Optimization Utilities
 * Advanced performance optimizations for React components
 */

/**
 * Throttle function with requestAnimationFrame for smooth 60fps
 */
export function throttleRAF<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 16 // ~60fps
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastFunc: NodeJS.Timeout | null = null;
  let lastRan: number = 0;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          requestAnimationFrame(() => {
            func(...args);
            lastRan = Date.now();
          });
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Debounce with requestIdleCallback for non-critical operations
 */
export function debounceIdle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(() => func(...args), { timeout: wait });
        } else {
          func(...args);
        }
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);

    if (callNow) {
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => func(...args), { timeout: wait });
      } else {
        func(...args);
      }
    }
  };
}

/**
 * Batch multiple state updates into a single render
 */
export class StateBatcher {
  private updates: Map<string, any> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private callback: (updates: Map<string, any>) => void;
  private readonly BATCH_DELAY_MS = 16; // ~60fps

  constructor(callback: (updates: Map<string, any>) => void) {
    this.callback = callback;
  }

  add(key: string, value: any): void {
    this.updates.set(key, value);

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      requestAnimationFrame(() => {
        if (this.updates.size > 0) {
          this.callback(this.updates);
          this.updates.clear();
        }
      });
      this.timer = null;
    }, this.BATCH_DELAY_MS);
  }

  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.updates.size > 0) {
      this.callback(this.updates);
      this.updates.clear();
    }
  }

  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updates.clear();
  }
}

/**
 * Memoize expensive computations with LRU cache
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.01,
    ...options,
  });
}

/**
 * Performance monitoring utility
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (typeof performance !== "undefined" && performance.mark) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = name;

    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    // Cleanup
    try {
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    } catch {
      // Ignore cleanup errors
    }

    return result;
  }

  return fn();
}

/**
 * Batch DOM reads and writes for better performance
 */
export class DOMBatcher {
  private readQueue: (() => void)[] = [];
  private writeQueue: (() => void)[] = [];
  private scheduled = false;

  read(fn: () => void): void {
    this.readQueue.push(fn);
    this.schedule();
  }

  write(fn: () => void): void {
    this.writeQueue.push(fn);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Execute all reads first
      this.readQueue.forEach(fn => fn());
      this.readQueue = [];

      // Then execute all writes
      this.writeQueue.forEach(fn => fn());
      this.writeQueue = [];

      this.scheduled = false;
    });
  }
}

