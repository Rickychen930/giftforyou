import React, { useState, useCallback, memo, useEffect } from "react";
import { resolveImageSrc, getResponsiveSizes } from "../../utils/image-optimization";

interface HeroSlideImageProps {
  image: string;
  alt: string;
  slideId: string;
  priority?: boolean;
  onLoad?: (slideId: string) => void;
  onError?: (slideId: string, e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Reusable hero slide image component
 * Handles loading states, error handling, and optimization
 * Memoized for performance optimization
 */
export const HeroSlideImage: React.FC<HeroSlideImageProps> = memo(({
  image,
  alt,
  slideId,
  priority = false,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");

  // Resolve image source on mount
  useEffect(() => {
    setImageSrc(resolveImageSrc(image));
  }, [image]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.(slideId);
  }, [slideId, onLoad]);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.currentTarget;
      const placeholderSrc = "/images/placeholder-bouquet.jpg";

      if (!hasError && target.src && !target.src.includes(placeholderSrc)) {
        setHasError(true);
        target.src = placeholderSrc;
        return;
      }

      target.style.display = "none";
      onError?.(slideId, e);
    },
    [slideId, hasError, onError]
  );

  return (
    <div className="heroSlide__media" data-swiper-parallax="-100">
      <div
        className={`heroSlide__imgWrapper ${
          isLoaded ? "heroSlide__imgWrapper--loaded" : ""
        }`}
      >
        <img
          className="heroSlide__img"
          src={imageSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          sizes={getResponsiveSizes()}
          onLoad={handleLoad}
          onError={handleError}
        />
        {!isLoaded && (
          <div
            className="heroSlide__imgPlaceholder"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}, (prevProps: HeroSlideImageProps, nextProps: HeroSlideImageProps) => {
  // Custom comparison for memoization
  return (
    prevProps.image === nextProps.image &&
    prevProps.alt === nextProps.alt &&
    prevProps.slideId === nextProps.slideId &&
    prevProps.priority === nextProps.priority &&
    prevProps.onLoad === nextProps.onLoad &&
    prevProps.onError === nextProps.onError
  );
});

HeroSlideImage.displayName = "HeroSlideImage";

