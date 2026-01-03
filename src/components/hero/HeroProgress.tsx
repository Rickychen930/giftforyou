/**
 * Hero Progress Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/hero/HeroProgress.css";

export interface HeroProgressProps {
  currentIndex: number;
  totalSlides: number;
  autoplayProgress?: number;
  isPlaying?: boolean;
}

interface HeroProgressState {
  // No state needed, but keeping for consistency
}

/**
 * Hero Progress Component
 * Class-based component for hero slider progress indicator
 * Optimized with shouldComponentUpdate for performance
 */
class HeroProgress extends Component<HeroProgressProps, HeroProgressState> {
  private baseClass: string = "hero-progress";

  /**
   * Prevent unnecessary re-renders for better performance
   */
  shouldComponentUpdate(nextProps: HeroProgressProps): boolean {
    return (
      nextProps.currentIndex !== this.props.currentIndex ||
      nextProps.totalSlides !== this.props.totalSlides ||
      nextProps.autoplayProgress !== this.props.autoplayProgress ||
      nextProps.isPlaying !== this.props.isPlaying
    );
  }

  private calculateSlideProgress(): number {
    const { currentIndex, totalSlides } = this.props;
    return ((currentIndex + 1) / totalSlides) * 100;
  }

  render(): React.ReactNode {
    const { currentIndex, totalSlides, autoplayProgress = 0, isPlaying = false } = this.props;

    if (totalSlides <= 1) return null;

    const slideProgress = this.calculateSlideProgress();

    return (
      <div className="hero-progress-wrapper">
        <div
          className={this.baseClass}
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSlides}
          aria-label={`Slide ${currentIndex + 1} of ${totalSlides}`}
        >
          <div
            className={`${this.baseClass}__bar`}
            style={{ width: `${slideProgress}%` }}
          />
          {isPlaying && (
            <div
              className={`${this.baseClass}__autoplay`}
              style={{ width: `${autoplayProgress}%` }}
              aria-hidden="true"
            />
          )}
        </div>
        <div
          className={`${this.baseClass}__counter`}
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          <span className={`${this.baseClass}__current`} aria-hidden="true">
            {currentIndex + 1}
          </span>
          <span className={`${this.baseClass}__separator`} aria-hidden="true">/</span>
          <span className={`${this.baseClass}__total`} aria-hidden="true">
            {totalSlides}
          </span>
        </div>
      </div>
    );
  }
}

export default HeroProgress;
