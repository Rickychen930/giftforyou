import React from "react";

/**
 * Reusable animated floral icon component
 * Luxury design with subtle animations
 */
export const FloralIcon: React.FC<{ className?: string }> = ({
  className = "heroSlide__flower",
}) => (
  <svg
    className={className}
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Animated petals */}
    <g className="heroSlide__flower-petals">
      <path
        className="heroSlide__flower-petal"
        d="M12 2s2 3.5 5 4 4.5 1.8 4 4-2.2 4.2-4 5-4 1-5 4c0 0-2-3.5-5-4s-4.5-1.8-4-4 2.2-4.2 4-5 4-1 5-4z"
        fill="currentColor"
        opacity="0.15"
      />
    </g>
    {/* Center bloom */}
    <circle
      className="heroSlide__flower-center"
      cx="12"
      cy="12"
      r="4"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.9"
    />
    {/* Inner details */}
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
  </svg>
);

