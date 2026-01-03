/**
 * Loading Progress Indicator Component (OOP)
 * Class-based component following SOLID principles
 * Shows loading progress for initial page load
 */

import React, { Component } from "react";
import "../../styles/LoadingProgressIndicator.css";

interface LoadingProgressIndicatorState {
  progress: number;
  isVisible: boolean;
  isComplete: boolean;
}

interface LoadingProgressIndicatorProps {
  /**
   * Minimum progress to show indicator (default: 0)
   */
  minProgress?: number;
  /**
   * Maximum progress value (default: 100)
   */
  maxProgress?: number;
  /**
   * Animation duration in ms (default: 300)
   */
  animationDuration?: number;
  /**
   * Auto-complete after reaching 100% (default: true)
   */
  autoComplete?: boolean;
}

/**
 * Loading Progress Indicator Component
 * Displays loading progress with smooth animations
 * Follows Single Responsibility: only handles progress display
 */
class LoadingProgressIndicator extends Component<
  LoadingProgressIndicatorProps,
  LoadingProgressIndicatorState
> {
  // Expose methods via ref
  public setProgress = (progress: number): void => {
    const { minProgress = 0, maxProgress = 100 } = this.props;
    const clampedProgress = Math.max(minProgress, Math.min(maxProgress, progress));
    this.setState({ progress: clampedProgress });
    
    if (clampedProgress >= maxProgress) {
      this.handleComplete();
    }
  };

  public complete = (): void => {
    const { maxProgress = 100 } = this.props;
    this.setState({ progress: maxProgress });
    this.handleComplete();
  };
  private baseClass: string = "loadingProgress";
  private progressInterval: NodeJS.Timeout | null = null;
  private completeTimeout: NodeJS.Timeout | null = null;
  private animationFrameId: number | null = null;
  private startTime: number = 0;

  constructor(props: LoadingProgressIndicatorProps) {
    super(props);
    this.state = {
      progress: props.minProgress || 0,
      isVisible: false,
      isComplete: false,
    };
  }

  componentDidMount(): void {
    this.startProgress();
  }

  componentWillUnmount(): void {
    this.cleanup();
  }

  /**
   * Start progress animation
   * Uses requestAnimationFrame for smooth updates
   */
  private startProgress(): void {
    const { minProgress = 0, maxProgress = 100, animationDuration = 300 } = this.props;
    
    this.setState({ isVisible: true });
    this.startTime = performance.now();

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - this.startTime;
      const duration = animationDuration;
      const progress = Math.min(
        minProgress + ((maxProgress - minProgress) * elapsed) / duration,
        maxProgress
      );

      this.setState({ progress });

      if (progress < maxProgress) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.handleComplete();
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Handle progress completion
   */
  private handleComplete(): void {
    const { autoComplete = true } = this.props;

    if (autoComplete) {
      // Wait a bit before hiding to show 100%
      this.completeTimeout = setTimeout(() => {
        this.setState({ isComplete: true });
        
        // Fade out animation
        setTimeout(() => {
          this.setState({ isVisible: false });
        }, 300);
      }, 200);
    }
  }


  /**
   * Cleanup timers and animation frames
   */
  private cleanup(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    if (this.completeTimeout) {
      clearTimeout(this.completeTimeout);
      this.completeTimeout = null;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Calculate progress percentage
   */
  private getProgressPercentage(): number {
    const { progress } = this.state;
    return Math.round(progress);
  }

  render(): React.ReactNode {
    const { isVisible, isComplete, progress } = this.state;
    const percentage = this.getProgressPercentage();

    if (!isVisible) return null;

    return (
      <div
        className={`${this.baseClass} ${isComplete ? `${this.baseClass}--complete` : ""}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Loading progress"
        aria-live="polite"
      >
        <div className={`${this.baseClass}__bar`}>
          <div
            className={`${this.baseClass}__fill`}
            style={{
              width: `${progress}%`,
              transition: isComplete ? "width 0.3s ease-out" : "none",
            }}
          />
          <div className={`${this.baseClass}__glow`} style={{ left: `${progress}%` }} />
        </div>
        {percentage < 100 && (
          <div className={`${this.baseClass}__percentage`}>{percentage}%</div>
        )}
      </div>
    );
  }
}

export default LoadingProgressIndicator;

