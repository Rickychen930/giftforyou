/**
 * Hero Collection Slider Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import HeroSlider, { HeroSliderContent } from "../../components/hero/HeroSlider";

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
 */
class HeroCollectionSlider extends Component<HeroCollectionSliderProps, HeroCollectionSliderState> {
  render(): React.ReactNode {
    const { content, loading = false } = this.props;
    return <HeroSlider content={content} loading={loading} />;
  }
}

export default HeroCollectionSlider;

