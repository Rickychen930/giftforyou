/**
 * Hero Collection Slider Component
 * Pure presentation component - receives all data via props
 * Luxury and responsive design
 */

import React from "react";
import HeroSlider, { HeroSliderContent } from "../hero/HeroSlider";

interface HeroCollectionSliderProps {
  content?: HeroSliderContent;
  loading?: boolean;
}

/**
 * Hero Collection Slider Component
 * Pure presentation - receives all data and loading state via props
 * No business logic or data fetching
 */
const HeroCollectionSlider: React.FC<HeroCollectionSliderProps> = ({
  content,
  loading = false,
}) => {
  return <HeroSlider content={content} loading={loading} />;
};

export default HeroCollectionSlider;
