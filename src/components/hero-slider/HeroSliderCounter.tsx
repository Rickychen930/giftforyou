import React, { memo } from "react";

interface HeroSliderCounterProps {
  current: number;
  total: number;
  progress: number;
  autoplayProgress: number;
  isPlaying: boolean;
  isVisible: boolean;
}

/**
 * Reusable counter component with progress indicators
 * Shows current slide number and progress bars
 * Memoized for performance optimization
 */
export const HeroSliderCounter: React.FC<HeroSliderCounterProps> = memo(({
  current,
  total,
  progress,
  autoplayProgress,
  isPlaying,
  isVisible,
}) => {
  if (total <= 1) return null;

  return (
    <div className="hero__counterWrapper">
      <div
        className="hero__counter"
        aria-live="polite"
        aria-atomic="true"
        role="status"
        aria-label={`Slide ${current} of ${total}`}
      >
        <span className="hero__counter-current" aria-hidden="true">
          {current}
        </span>
        <span className="hero__counter-separator" aria-hidden="true">
          /
        </span>
        <span className="hero__counter-total" aria-hidden="true">
          {total}
        </span>
      </div>
      <div className="hero__progress" aria-hidden="true">
        <div
          className="hero__progressBar"
          style={{
            width: `${progress}%`,
          }}
        />
        {isPlaying && isVisible && (
          <div
            className="hero__progressAutoplay"
            style={{
              width: `${autoplayProgress}%`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}, (prevProps: HeroSliderCounterProps, nextProps: HeroSliderCounterProps) => {
  // Custom comparison for memoization
  return (
    prevProps.current === nextProps.current &&
    prevProps.total === nextProps.total &&
    Math.abs(prevProps.progress - nextProps.progress) < 1 &&
    Math.abs(prevProps.autoplayProgress - nextProps.autoplayProgress) < 1 &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.isVisible === nextProps.isVisible
  );
});

HeroSliderCounter.displayName = "HeroSliderCounter";

