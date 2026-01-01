/**
 * Social Proof Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/SocialProof.css";
import { API_BASE } from "../../config/api";

interface SocialProofProps {
  bouquetId?: string;
  className?: string;
}

interface OrderStats {
  recentOrdersCount: number;
  lastOrderTime?: string;
}

interface SocialProofState {
  stats: OrderStats;
  isLoading: boolean;
}

/**
 * Social Proof Component
 * Class-based component for social proof display
 */
class SocialProof extends Component<SocialProofProps, SocialProofState> {
  private baseClass: string = "socialProof";

  constructor(props: SocialProofProps) {
    super(props);
    this.state = {
      stats: { recentOrdersCount: 0 },
      isLoading: true,
    };
  }

  componentDidMount(): void {
    this.fetchStats();
  }

  componentDidUpdate(prevProps: SocialProofProps): void {
    if (prevProps.bouquetId !== this.props.bouquetId) {
      this.fetchStats();
    }
  }

  private fetchStats = async (): Promise<void> => {
    const { bouquetId } = this.props;
    this.setState({ isLoading: true });

    try {
      const endpoint = bouquetId
        ? `${API_BASE}/api/orders/stats?bouquetId=${bouquetId}`
        : `${API_BASE}/api/orders/stats/recent`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        this.setState({
          stats: {
            recentOrdersCount: data.count || 0,
            lastOrderTime: data.lastOrderTime,
          },
          isLoading: false,
        });
      } else {
        throw new Error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
      // Fallback to random number for demo (remove in production)
      this.setState({
        stats: {
          recentOrdersCount: Math.floor(Math.random() * 20) + 5,
        },
        isLoading: false,
      });
    }
  };

  private getMessage(): string {
    const { recentOrdersCount } = this.state.stats;

    if (recentOrdersCount === 1) {
      return "1 orang baru saja memesan ini";
    } else if (recentOrdersCount <= 5) {
      return `${recentOrdersCount} orang baru saja memesan ini`;
    } else if (recentOrdersCount <= 20) {
      return `${recentOrdersCount} orang telah memesan dalam 24 jam terakhir`;
    } else {
      return `${recentOrdersCount}+ pesanan dalam 24 jam terakhir`;
    }
  }

  private renderIcon(): React.ReactNode {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  render(): React.ReactNode {
    const { className = "" } = this.props;
    const { stats, isLoading } = this.state;

    if (isLoading || stats.recentOrdersCount === 0) {
      return null; // Don't show if no data
    }

    return (
      <div className={`${this.baseClass} ${className}`.trim()} role="status" aria-live="polite">
        <div className={`${this.baseClass}__icon`} aria-hidden="true">
          {this.renderIcon()}
        </div>
        <span className={`${this.baseClass}__text`}>{this.getMessage()}</span>
      </div>
    );
  }
}

export default SocialProof;

