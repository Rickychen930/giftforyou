import React from "react";
import "../../styles/hero/HeroPlayPause.css";

export interface HeroPlayPauseProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const HeroPlayPause: React.FC<HeroPlayPauseProps> = ({
  isPlaying,
  onToggle,
}) => {
  return (
    <button
      className="hero-play-pause"
      onClick={onToggle}
      aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
      aria-pressed={isPlaying}
      type="button"
      title={isPlaying ? "Pause slideshow (Space)" : "Play slideshow (Space)"}
    >
      {isPlaying ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="6"
            y="4"
            width="4"
            height="16"
            rx="1"
            fill="currentColor"
          />
          <rect
            x="14"
            y="4"
            width="4"
            height="16"
            rx="1"
            fill="currentColor"
          />
        </svg>
      ) : (
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
      )}
    </button>
  );
};

export default HeroPlayPause;

