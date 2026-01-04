import React, { memo } from "react";
import type { Swiper as SwiperType } from "swiper";

interface HeroSliderNavigationProps {
  swiperInstance: SwiperType | null;
  isPlaying: boolean;
  onToggleAutoplay: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  slidesCount: number;
}

/**
 * Reusable navigation component for hero slider
 * Includes prev/next buttons and play/pause control
 * Memoized for performance optimization
 */
export const HeroSliderNavigation: React.FC<HeroSliderNavigationProps> = memo(({
  swiperInstance,
  isPlaying,
  onToggleAutoplay,
  onFocus,
  onBlur,
  slidesCount,
}) => {
  if (slidesCount <= 1) return null;

  return (
    <>
      <button
        className="hero__nav hero__nav-prev"
        aria-label="Previous slide"
        type="button"
        title="Previous slide (Left Arrow)"
        tabIndex={0}
        onFocus={() => {
          onFocus?.();
          if (swiperInstance) {
            swiperInstance.autoplay?.pause();
          }
        }}
        onBlur={() => {
          onBlur?.();
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        className="hero__nav hero__nav-next"
        aria-label="Next slide"
        type="button"
        title="Next slide (Right Arrow)"
        tabIndex={0}
        onFocus={() => {
          onFocus?.();
          if (swiperInstance) {
            swiperInstance.autoplay?.pause();
          }
        }}
        onBlur={() => {
          onBlur?.();
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        className="hero__playPause"
        onClick={onToggleAutoplay}
        aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
        aria-pressed={isPlaying}
        type="button"
        title={isPlaying ? "Pause slideshow (Space)" : "Play slideshow (Space)"}
        tabIndex={0}
      >
        {isPlaying ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="6"
              y="4"
              width="4"
              height="16"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="14"
              y="4"
              width="4"
              height="16"
              rx="1"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}, (prevProps: HeroSliderNavigationProps, nextProps: HeroSliderNavigationProps) => {
  // Custom comparison for memoization
  return (
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.slidesCount === nextProps.slidesCount &&
    prevProps.swiperInstance === nextProps.swiperInstance
  );
});

HeroSliderNavigation.displayName = "HeroSliderNavigation";

