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
  isBeginning: boolean;
  isEnd: boolean;
}

/**
 * Hero Navigation Component
 * Class-based component for hero slider navigation buttons
 */
class HeroNavigation extends Component<HeroNavigationProps, HeroNavigationState> {
  private baseClass: string = "hero-nav";

  constructor(props: HeroNavigationProps) {
    super(props);
    this.state = {
      isBeginning: true,
      isEnd: false,
    };
  }

  componentDidMount(): void {
    this.updateNavigationState();
  }

  componentDidUpdate(prevProps: HeroNavigationProps): void {
    if (prevProps.swiperInstance !== this.props.swiperInstance) {
      this.updateNavigationState();
      this.setupSwiperListeners();
    }
  }

  componentWillUnmount(): void {
    this.cleanupSwiperListeners();
  }

  private updateNavigationState(): void {
    const { swiperInstance } = this.props;
    if (!swiperInstance) {
      this.setState({ isBeginning: true, isEnd: false });
      return;
    }

    const isLoop = swiperInstance.params?.loop ?? false;
    if (isLoop) {
      this.setState({ isBeginning: false, isEnd: false });
    } else {
      this.setState({
        isBeginning: swiperInstance.isBeginning ?? true,
        isEnd: swiperInstance.isEnd ?? false,
      });
    }
  }

  private slideChangeHandler = (): void => {
    this.updateNavigationState();
  };

  private setupSwiperListeners(): void {
    const { swiperInstance } = this.props;
    if (!swiperInstance) return;

    swiperInstance.on("slideChange", this.slideChangeHandler);
  }

  private cleanupSwiperListeners(): void {
    const { swiperInstance } = this.props;
    if (!swiperInstance) return;

    swiperInstance.off("slideChange", this.slideChangeHandler);
  }

  private handlePrev = (): void => {
    const { swiperInstance, onPrev } = this.props;
    const { isBeginning } = this.state;
    if (isBeginning) return;
    swiperInstance?.slidePrev();
    onPrev?.();
  };

  private handleNext = (): void => {
    const { swiperInstance, onNext } = this.props;
    const { isEnd } = this.state;
    if (isEnd) return;
    swiperInstance?.slideNext();
    onNext?.();
  };

  private renderPrevButton(): React.ReactNode {
    const { onFocus, onBlur } = this.props;
    const { isBeginning } = this.state;

    return (
      <button
        className={`${this.baseClass} hero-slider__nav--prev ${isBeginning ? `${this.baseClass}--disabled` : ""}`}
        aria-label="Previous slide"
        aria-disabled={isBeginning}
        type="button"
        title="Previous slide (Left Arrow)"
        onClick={this.handlePrev}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={isBeginning}
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
    const { isEnd } = this.state;

    return (
      <button
        className={`${this.baseClass} hero-slider__nav--next ${isEnd ? `${this.baseClass}--disabled` : ""}`}
        aria-label="Next slide"
        aria-disabled={isEnd}
        type="button"
        title="Next slide (Right Arrow)"
        onClick={this.handleNext}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={isEnd}
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
