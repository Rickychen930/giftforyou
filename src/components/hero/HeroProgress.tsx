import React from "react";
import "../../styles/hero/HeroProgress.css";

export interface HeroProgressProps {
  currentIndex: number;
  totalSlides: number;
  autoplayProgress?: number;
  isPlaying?: boolean;
}

const HeroProgress: React.FC<HeroProgressProps> = ({
  currentIndex,
  totalSlides,
  autoplayProgress = 0,
  isPlaying = false,
}) => {
  if (totalSlides <= 1) return null;

  const slideProgress = ((currentIndex + 1) / totalSlides) * 100;

  return (
    <div className="hero-progress-wrapper">
      <div
        className="hero-progress"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSlides}
        aria-label={`Slide ${currentIndex + 1} of ${totalSlides}`}
      >
        <div
          className="hero-progress__bar"
          style={{ width: `${slideProgress}%` }}
        />
        {isPlaying && (
          <div
            className="hero-progress__autoplay"
            style={{ width: `${autoplayProgress}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      <div
        className="hero-progress__counter"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        <span className="hero-progress__current" aria-hidden="true">
          {currentIndex + 1}
        </span>
        <span className="hero-progress__separator" aria-hidden="true">/</span>
        <span className="hero-progress__total" aria-hidden="true">
          {totalSlides}
        </span>
      </div>
    </div>
  );
};

export default HeroProgress;

