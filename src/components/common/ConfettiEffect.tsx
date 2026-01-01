/**
 * Confetti Effect Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject } from "react";
import "../../styles/ConfettiEffect.css";

interface ConfettiEffectProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
}

interface ConfettiEffectState {
  particles: HTMLDivElement[];
}

/**
 * Confetti Effect Component
 * Class-based component for confetti animation
 */
class ConfettiEffect extends Component<ConfettiEffectProps, ConfettiEffectState> {
  private baseClass: string = "confettiContainer";
  private containerRef: RefObject<HTMLDivElement>;
  private cleanupTimer: NodeJS.Timeout | null;

  private readonly colors = [
    "var(--brand-rose-500)",
    "var(--brand-green-500)",
    "var(--brand-rose-600)",
    "var(--brand-green-600)",
    "#f59e0b",
    "#8b5cf6",
  ];

  constructor(props: ConfettiEffectProps) {
    super(props);
    this.state = {
      particles: [],
    };
    this.containerRef = React.createRef();
    this.cleanupTimer = null;
  }

  componentDidUpdate(prevProps: ConfettiEffectProps): void {
    if (this.props.trigger && !prevProps.trigger) {
      this.createParticles();
    }
  }

  componentWillUnmount(): void {
    this.cleanupParticles();
  }

  private createParticles(): void {
    if (!this.containerRef.current) return;

    const { particleCount = 50, duration = 3000 } = this.props;
    const container = this.containerRef.current;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "confettiParticle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
      particle.style.animationDelay = `${Math.random() * 0.5}s`;
      particle.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
      container.appendChild(particle);
      particles.push(particle);
    }

    this.setState({ particles });

    // Cleanup after animation
    this.cleanupTimer = setTimeout(() => {
      this.cleanupParticles();
    }, duration);
  }

  private cleanupParticles(): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.state.particles.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });

    this.setState({ particles: [] });
  }

  render(): React.ReactNode {
    const { trigger } = this.props;

    if (!trigger) return null;

    return (
      <div
        ref={this.containerRef}
        className={this.baseClass}
        aria-hidden="true"
      />
    );
  }
}

export default ConfettiEffect;

