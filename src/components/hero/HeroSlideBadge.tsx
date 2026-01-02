/**
 * Hero Slide Badge Component
 * Reusable badge component for hero slides
 * OOP-based class component following SOLID principles
 * Luxury, elegant, and responsive design
 */

import React, { Component } from "react";
import "../../styles/hero/HeroSlideBadge.css";

export interface HeroSlideBadgeProps {
  text: string;
  variant?: "default" | "featured" | "new" | "custom";
  animated?: boolean;
}

interface HeroSlideBadgeState {
  isVisible: boolean;
}

/**
 * Hero Slide Badge Component
 * Displays an elegant badge with luxury styling
 * Follows Single Responsibility Principle: only handles badge rendering
 */
export class HeroSlideBadge extends Component<HeroSlideBadgeProps, HeroSlideBadgeState> {
  constructor(props: HeroSlideBadgeProps) {
    super(props);
    this.state = {
      isVisible: false,
    };
  }

  componentDidMount(): void {
    // Trigger animation after mount
    requestAnimationFrame(() => {
      this.setState({ isVisible: true });
    });
  }

  private getVariantClass(): string {
    const { variant = "default" } = this.props;
    return `hero-slide-badge--${variant}`;
  }

  render(): React.ReactNode {
    const { text, animated = true } = this.props;
    const { isVisible } = this.state;

    if (!text) return null;

    return (
      <div
        className={`hero-slide-badge ${this.getVariantClass()} ${animated && isVisible ? "is-visible" : ""}`}
        data-swiper-parallax="-50"
        aria-label={`Badge: ${text}`}
      >
        <span className="hero-slide-badge__text">{text}</span>
        <span className="hero-slide-badge__glow" aria-hidden="true" />
      </div>
    );
  }
}

export default HeroSlideBadge;

