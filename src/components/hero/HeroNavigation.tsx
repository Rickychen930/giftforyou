import React from "react";
import "../../styles/hero/HeroNavigation.css";
import type { Swiper as SwiperType } from "swiper";

export interface HeroNavigationProps {
  swiperInstance: SwiperType | null;
  onPrev?: () => void;
  onNext?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const HeroNavigation: React.FC<HeroNavigationProps> = ({
  swiperInstance,
  onPrev,
  onNext,
  onFocus,
  onBlur,
}) => {
  const handlePrev = () => {
    swiperInstance?.slidePrev();
    onPrev?.();
  };

  const handleNext = () => {
    swiperInstance?.slideNext();
    onNext?.();
  };

  return (
    <>
      <button
        className="hero-nav hero-slider__nav--prev"
        aria-label="Previous slide"
        type="button"
        title="Previous slide (Left Arrow)"
        onClick={handlePrev}
        onFocus={onFocus}
        onBlur={onBlur}
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
        className="hero-nav hero-slider__nav--next"
        aria-label="Next slide"
        type="button"
        title="Next slide (Right Arrow)"
        onClick={handleNext}
        onFocus={onFocus}
        onBlur={onBlur}
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
    </>
  );
};

export default HeroNavigation;

