/**
 * Optimized Image Loading Hook
 * Implements progressive loading, lazy loading, and error handling
 * Priority: HIGH - Performance optimization
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

interface UseOptimizedImageOptions {
  src: string | undefined;
  fallbackSrc?: string;
  lazy?: boolean;
  priority?: boolean; // For above-the-fold images
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface UseOptimizedImageResult {
  imageSrc: string | undefined;
  isLoading: boolean;
  hasError: boolean;
  isInView: boolean;
  ref: (node: HTMLImageElement | null) => void;
}

/**
 * Hook for optimized image loading with lazy loading and progressive enhancement
 */
export function useOptimizedImage({
  src,
  fallbackSrc = "/images/placeholder-bouquet.jpg",
  lazy = true,
  priority = false,
  onLoad,
  onError,
}: UseOptimizedImageOptions): UseOptimizedImageResult {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Determine final image source
  const imageSrc = useMemo(() => {
    if (hasError && fallbackSrc) return fallbackSrc;
    if (!src) return fallbackSrc;
    return src;
  }, [src, fallbackSrc, hasError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const currentImg = imgRef.current;
    if (!currentImg) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(currentImg);
    observerRef.current = observer;

    return () => {
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg);
      }
    };
  }, [lazy, priority, isInView]);

  // Preload image when in view
  useEffect(() => {
    if (!isInView || !imageSrc || imageSrc === fallbackSrc) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      const error = new Error(`Failed to load image: ${imageSrc}`);
      onError?.(error);
    };
    img.src = imageSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc, isInView, fallbackSrc, onLoad, onError]);

  // Ref callback for intersection observer
  const ref = useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node;
  }, []);

  return {
    imageSrc: isInView ? imageSrc : undefined,
    isLoading,
    hasError,
    isInView,
    ref,
  };
}

