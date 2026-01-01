/**
 * Hero Play Pause Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/hero/HeroPlayPause.css";

export interface HeroPlayPauseProps {
  isPlaying: boolean;
  onToggle: () => void;
}

interface HeroPlayPauseState {
  // No state needed, but keeping for consistency
}

/**
 * Hero Play Pause Component
 * Class-based component for hero slider play/pause control
 */
class HeroPlayPause extends Component<HeroPlayPauseProps, HeroPlayPauseState> {
  private baseClass: string = "hero-play-pause";

  private renderPauseIcon(): React.ReactNode {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
        <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
      </svg>
    );
  }

  private renderPlayIcon(): React.ReactNode {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" fill="currentColor" />
      </svg>
    );
  }

  render(): React.ReactNode {
    const { isPlaying, onToggle } = this.props;

    return (
      <button
        className={this.baseClass}
        onClick={onToggle}
        aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
        aria-pressed={isPlaying}
        type="button"
        title={isPlaying ? "Pause slideshow (Space)" : "Play slideshow (Space)"}
      >
        {isPlaying ? this.renderPauseIcon() : this.renderPlayIcon()}
      </button>
    );
  }
}

export default HeroPlayPause;
