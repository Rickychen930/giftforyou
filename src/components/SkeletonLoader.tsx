import React from "react";
import "../styles/SkeletonLoader.css";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  lines?: number;
  animated?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width,
  height,
  borderRadius,
  className = "",
  variant = "rectangular",
  lines = 1,
  animated = true,
}) => {
  const style: React.CSSProperties = {
    width: width || (variant === "circular" ? "40px" : "100%"),
    height: height || (variant === "circular" ? "40px" : variant === "text" ? "1rem" : "200px"),
    borderRadius: borderRadius || (variant === "circular" ? "50%" : variant === "text" ? "4px" : "12px"),
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={`skeletonLoader skeletonLoader--text ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`skeletonLoader__line ${animated ? "skeletonLoader--animated" : ""}`}
            style={{
              ...style,
              width: index === lines - 1 ? "80%" : "100%",
              marginBottom: index < lines - 1 ? "0.5rem" : "0",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`skeletonLoader skeletonLoader--card ${className}`}>
        <div className={`skeletonLoader__header ${animated ? "skeletonLoader--animated" : ""}`} style={{ borderRadius: "12px 12px 0 0" }} />
        <div className={`skeletonLoader__content ${animated ? "skeletonLoader--animated" : ""}`}>
          <div className={`skeletonLoader__line ${animated ? "skeletonLoader--animated" : ""}`} style={{ width: "100%", height: "1rem", marginBottom: "0.75rem" }} />
          <div className={`skeletonLoader__line ${animated ? "skeletonLoader--animated" : ""}`} style={{ width: "80%", height: "1rem", marginBottom: "0.5rem" }} />
          <div className={`skeletonLoader__line ${animated ? "skeletonLoader--animated" : ""}`} style={{ width: "60%", height: "1rem" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`skeletonLoader ${animated ? "skeletonLoader--animated" : ""} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
};

export default SkeletonLoader;
