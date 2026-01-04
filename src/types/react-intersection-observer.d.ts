/**
 * Type declarations for react-intersection-observer
 * This file ensures TypeScript can find the module types
 */

declare module "react-intersection-observer" {
  import { RefObject } from "react";

  export interface UseInViewOptions {
    threshold?: number | number[];
    root?: Element | null;
    rootMargin?: string;
    triggerOnce?: boolean;
    skip?: boolean;
    initialInView?: boolean;
    fallbackInView?: boolean;
    trackVisibility?: boolean;
    delay?: number;
  }

  export interface IntersectionObserverEntry {
    boundingClientRect: DOMRectReadOnly;
    intersectionRatio: number;
    intersectionRect: DOMRectReadOnly;
    isIntersecting: boolean;
    rootBounds: DOMRectReadOnly | null;
    target: Element;
    time: number;
  }

  export interface UseInViewReturn {
    ref: (node?: Element | null) => void;
    inView: boolean;
    entry?: IntersectionObserverEntry;
  }

  export function useInView(
    options?: UseInViewOptions
  ): UseInViewReturn & { ref: (node?: Element | null) => void };

  export interface InViewProps extends UseInViewOptions {
    children: (props: {
      ref: RefObject<Element> | ((node?: Element | null) => void);
      inView: boolean;
      entry?: IntersectionObserverEntry;
    }) => React.ReactNode;
    as?: React.ElementType;
    onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
  }

  export const InView: React.FC<InViewProps>;
}

