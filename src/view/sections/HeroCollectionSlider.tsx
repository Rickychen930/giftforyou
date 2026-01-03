/**
 * Hero Collection Slider Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, Suspense, lazy } from "react";
import type { HeroSliderContent } from "../../components/hero/HeroSlider";
import SkeletonLoader from "../../components/common/SkeletonLoader";

// Lazy load HeroSlider to reduce initial bundle size
// Swiper.js is heavy, so we load it only when needed
const HeroSlider = lazy(() => import("../../components/hero/HeroSlider"));

const HeroSliderLoader: React.FC = () => (
  <div 
    className="hero-slider-loader"
    role="status"
    aria-live="polite"
    aria-label="Memuat hero slider"
    style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "500px",
      background: "linear-gradient(135deg, rgba(212, 140, 156, 0.1) 0%, rgba(168, 213, 186, 0.1) 100%)",
      flexDirection: "column",
      gap: "1rem"
    }}
  >
    <SkeletonLoader variant="rectangular" width="100%" height="500px" />
    <SkeletonLoader variant="text" width="300px" height={20} />
    <SkeletonLoader variant="text" width="200px" height={16} />
  </div>
);

interface HeroCollectionSliderProps {
  content?: HeroSliderContent;
  loading?: boolean;
}

interface HeroCollectionSliderState {
  // No state needed, but keeping for consistency
}

/**
 * Hero Collection Slider Component
 * Pure presentation - receives all data and loading state via props
 * No business logic or data fetching
 * Optimized with shouldComponentUpdate to prevent unnecessary re-renders
 */
class HeroCollectionSlider extends Component<HeroCollectionSliderProps, HeroCollectionSliderState> {
  /**
   * Prevent unnecessary re-renders
   */
  shouldComponentUpdate(nextProps: HeroCollectionSliderProps): boolean {
    return (
      nextProps.loading !== this.props.loading ||
      nextProps.content !== this.props.content ||
      (nextProps.content?.slides?.length ?? 0) !== (this.props.content?.slides?.length ?? 0)
    );
  }

  render(): React.ReactNode {
    const { content, loading = false } = this.props;
    return (
      <Suspense fallback={<HeroSliderLoader />}>
        <HeroSlider content={content} loading={loading} />
      </Suspense>
    );
  }
}

export default HeroCollectionSlider;

