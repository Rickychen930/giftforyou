import React from "react";
import "../styles/SkeletonLoader.css";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = "1rem",
  borderRadius = "8px",
  className = "",
  variant = "rectangular",
}) => {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius:
      variant === "circular"
        ? "50%"
        : variant === "text"
        ? "4px"
        : borderRadius,
  };

  return (
    <div
      className={`skeleton-loader ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div className="skeleton-loader__shimmer" />
    </div>
  );
};

export default SkeletonLoader;

