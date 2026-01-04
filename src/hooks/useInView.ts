/**
 * Custom useInView hook using native IntersectionObserver API
 * Replaces react-intersection-observer for better compatibility
 * Follows SOLID, DRY principles
 */

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseInViewOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
  skip?: boolean;
  initialInView?: boolean;
}

export interface UseInViewReturn {
  ref: (node?: Element | null) => void;
  inView: boolean;
  entry?: IntersectionObserverEntry;
}

/**
 * Hook to detect when an element enters the viewport
 */
export function useInView(options: UseInViewOptions = {}): UseInViewReturn {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = "0px",
    triggerOnce = false,
    skip = false,
    initialInView = false,
  } = options;

  const [inView, setInView] = useState(initialInView);
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>(undefined);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (node?: Element | null) => {
      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      elementRef.current = node ?? null;

      if (skip || !node || typeof IntersectionObserver === "undefined") {
        setInView(initialInView);
        return;
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          const isIntersecting = entry.isIntersecting;
          setInView(isIntersecting);
          setEntry(entry);

          if (isIntersecting && triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        },
        {
          threshold,
          root,
          rootMargin,
        }
      );

      observerRef.current.observe(node);
    },
    [threshold, root, rootMargin, triggerOnce, skip, initialInView]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return { ref: setRef, inView, entry };
}

