/**
 * Hero Skeleton Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/hero/HeroSkeleton.css";

interface HeroSkeletonState {
  // No state needed, but keeping for consistency
}

/**
 * Hero Skeleton Component
 * Class-based component for hero slider loading skeleton
 */
class HeroSkeleton extends Component<{}, HeroSkeletonState> {
  private baseClass: string = "hero-skeleton";

  render(): React.ReactNode {
    return (
      <section className={this.baseClass} aria-label="Memuat hero slider">
        <div className={`${this.baseClass}__container`}>
          <div className={`${this.baseClass}__image`} />
          <div className={`${this.baseClass}__content`}>
            <div className={`${this.baseClass}__badge`} />
            <div className={`${this.baseClass}__title`} />
            <div className={`${this.baseClass}__subtitle`} />
            <div className={`${this.baseClass}__buttons`}>
              <div className={`${this.baseClass}__button`} />
              <div className={`${this.baseClass}__button`} />
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default HeroSkeleton;
