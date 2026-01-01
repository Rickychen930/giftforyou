/**
 * Hero Indicators Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/hero/HeroIndicators.css";

export interface HeroIndicatorsProps {
  totalSlides: number;
  activeIndex: number;
  onSlideClick?: (index: number) => void;
}

interface HeroIndicatorsState {
  // No state needed, but keeping for consistency
}

/**
 * Hero Indicators Component
 * Class-based component for hero slider indicators
 */
class HeroIndicators extends Component<HeroIndicatorsProps, HeroIndicatorsState> {
  private baseClass: string = "hero-indicators";

  private handleSlideClick = (index: number): void => {
    if (this.props.onSlideClick) {
      this.props.onSlideClick(index);
    }
  };

  private renderIndicator(index: number): React.ReactNode {
    const { activeIndex } = this.props;
    const isActive = index === activeIndex;

    return (
      <button
        key={index}
        className={`${this.baseClass}__dot ${isActive ? `${this.baseClass}__dot--active` : ""}`}
        role="tab"
        aria-label={`Go to slide ${index + 1}`}
        aria-selected={isActive}
        onClick={() => this.handleSlideClick(index)}
      />
    );
  }

  render(): React.ReactNode {
    const { totalSlides } = this.props;

    if (totalSlides <= 1) return null;

    return (
      <div className={this.baseClass} role="tablist" aria-label="Slide indicators">
        {Array.from({ length: totalSlides }).map((_, index) => this.renderIndicator(index))}
      </div>
    );
  }
}

export default HeroIndicators;
