import React from "react";

/**
 * Loading skeleton component for hero slider
 * Provides smooth loading experience
 */
export const HeroSliderSkeleton: React.FC = () => (
  <section className="hero hero--loading" aria-label="Memuat hero slider">
    <div className="hero__skeleton">
      <div className="hero__skeleton-image" />
      <div className="hero__skeleton-content">
        <div className="hero__skeleton-badge" />
        <div className="hero__skeleton-title" />
        <div className="hero__skeleton-subtitle" />
        <div className="hero__skeleton-buttons">
          <div className="hero__skeleton-button" />
          <div className="hero__skeleton-button" />
        </div>
      </div>
    </div>
  </section>
);

