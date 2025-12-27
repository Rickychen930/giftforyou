/**
 * Custom hook for image loading with error handling
 */

import { useState, useCallback, useEffect } from "react";

interface UseImageLoaderResult {
  imageLoaded: boolean;
  imageError: boolean;
  handleImageLoad: () => void;
  handleImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  reset: () => void;
}

/**
 * Hook for managing image loading state
 */
export function useImageLoader(
  fallbackSrc?: string,
  onError?: (src: string) => void
): UseImageLoaderResult {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (fallbackSrc && img.src !== fallbackSrc) {
        img.onerror = null;
        img.src = fallbackSrc;
        onError?.(img.src);
      } else {
        setImageError(true);
        setImageLoaded(true);
      }
    },
    [fallbackSrc, onError]
  );

  const reset = useCallback(() => {
    setImageLoaded(false);
    setImageError(false);
  }, []);

  return { imageLoaded, imageError, handleImageLoad, handleImageError, reset };
}

