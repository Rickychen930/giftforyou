/**
 * Hero Navigation Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/hero/HeroNavigation.css";
import type { Swiper as SwiperType } from "swiper";

export interface HeroNavigationProps {
  swiperInstance: SwiperType | null;
  onPrev?: () => void;
  onNext?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface HeroNavigationState {
  // No state needed, but keeping for consistency
}

/**
 * Hero Navigation Component
 * Class-based component for hero slider navigation buttons
 */
class HeroNavigation extends Component<HeroNavigationProps, HeroNavigationState> {
  private baseClass: string = "hero-nav";

  private handlePrev = (): void => {
    const { swiperInstance, onPrev } = this.props;
    swiperInstance?.slidePrev();
    onPrev?.();
  };

  private handleNext = (): void => {
    const { swiperInstance, onNext } = this.props;
    swiperInstance?.slideNext();
    onNext?.();
  };

  private renderPrevButton(): React.ReactNode {
    const { onFocus, onBlur } = this.props;

    return (
      <button
        className={`${this.baseClass} hero-slider__nav--prev`}
        aria-label="Previous slide"
        type="button"
        title="Previous slide (Left Arrow)"
        onClick={this.handlePrev}
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
    );
  }

  private renderNextButton(): React.ReactNode {
    const { onFocus, onBlur } = this.props;

    return (
      <button
        className={`${this.baseClass} hero-slider__nav--next`}
        aria-label="Next slide"
        type="button"
        title="Next slide (Right Arrow)"
        onClick={this.handleNext}
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
    );
  }

  render(): React.ReactNode {
    return (
      <>
        {this.renderPrevButton()}
        {this.renderNextButton()}
      </>
    );
  }
}

export default HeroNavigation;
