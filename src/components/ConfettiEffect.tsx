import React, { useEffect, useRef } from "react";
import "../styles/ConfettiEffect.css";

interface ConfettiEffectProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  trigger,
  duration = 3000,
  particleCount = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const container = containerRef.current;
    const colors = [
      "var(--brand-rose-500)",
      "var(--brand-green-500)",
      "var(--brand-rose-600)",
      "var(--brand-green-600)",
      "#f59e0b",
      "#8b5cf6",
    ];

    // Create particles
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "confettiParticle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDelay = `${Math.random() * 0.5}s`;
      particle.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
      container.appendChild(particle);
      particles.push(particle);
    }

    // Cleanup after animation
    const timer = setTimeout(() => {
      particles.forEach((particle) => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    }, duration);

    return () => {
      clearTimeout(timer);
      particles.forEach((particle) => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [trigger, duration, particleCount]);

  if (!trigger) return null;

  return (
    <div
      ref={containerRef}
      className="confettiContainer"
      aria-hidden="true"
    />
  );
};

export default ConfettiEffect;

