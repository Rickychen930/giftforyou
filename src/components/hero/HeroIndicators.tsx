import React from "react";
import "../../styles/hero/HeroIndicators.css";

export interface HeroIndicatorsProps {
  totalSlides: number;
  activeIndex: number;
  onSlideClick?: (index: number) => void;
}

const HeroIndicators: React.FC<HeroIndicatorsProps> = ({
  totalSlides,
  activeIndex,
  onSlideClick,
}) => {
  if (totalSlides <= 1) return null;

  return (
    <div className="hero-indicators" role="tablist" aria-label="Slide indicators">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          className={`hero-indicators__dot ${
            index === activeIndex ? "hero-indicators__dot--active" : ""
          }`}
          role="tab"
          aria-label={`Go to slide ${index + 1}`}
          aria-selected={index === activeIndex}
          onClick={() => onSlideClick?.(index)}
        />
      ))}
    </div>
  );
};

export default HeroIndicators;

