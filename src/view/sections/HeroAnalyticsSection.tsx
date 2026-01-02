/**
 * Hero Analytics Section Component (OOP)
 * Class-based component following SOLID principles
 * Displays analytics data for hero slider
 */

import React, { Component } from "react";
import "../../styles/HeroAnalyticsSection.css";
import { API_BASE } from "../../config/api";
import { getAccessToken } from "../../utils/auth-utils";
import EmptyState from "../../components/common/EmptyState";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import SectionHeader from "../../components/common/SectionHeader";
import { ErrorIcon, ChartIcon, EyeIcon } from "../../components/icons";

type HeroAnalyticsData = {
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  averageTimeSpent: number;
  slides: Array<{
    slideId: string;
    slideTitle: string;
    views: number;
    clicks: number;
    ctr: number;
    timeSpent: number;
  }>;
  period: {
    start: string;
    end: string;
    days: number;
  };
  trends: {
    views: { change: number; trend: "up" | "down" | "stable" };
    clicks: { change: number; trend: "up" | "down" | "stable" };
    ctr: { change: number; trend: "up" | "down" | "stable" };
  };
};

interface HeroAnalyticsSectionProps {
  period?: "7d" | "30d" | "90d" | "all";
  onPeriodChange?: (period: "7d" | "30d" | "90d" | "all") => void;
}

interface HeroAnalyticsSectionState {
  loading: boolean;
  error: string | null;
  data: HeroAnalyticsData | null;
  selectedPeriod: "7d" | "30d" | "90d" | "all";
}

/**
 * Hero Analytics Section Component
 * Class-based component for hero slider analytics
 */
class HeroAnalyticsSection extends Component<HeroAnalyticsSectionProps, HeroAnalyticsSectionState> {
  private baseClass: string = "heroAnalytics";

  constructor(props: HeroAnalyticsSectionProps) {
    super(props);
    this.state = {
      loading: true,
      error: null,
      data: null,
      selectedPeriod: props.period || "30d",
    };
  }

  componentDidMount(): void {
    this.loadAnalytics();
  }

  componentDidUpdate(prevProps: HeroAnalyticsSectionProps, prevState: HeroAnalyticsSectionState): void {
    if (prevState.selectedPeriod !== this.state.selectedPeriod) {
      this.loadAnalytics();
    }
  }

  /**
   * Load analytics data from API
   */
  private loadAnalytics = async (): Promise<void> => {
    this.setState({ loading: true, error: null });
    try {
      const token = getAccessToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const period = this.state.selectedPeriod;
      const res = await fetch(`${API_BASE}/api/analytics/hero?period=${period}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error(`Failed to load analytics: ${res.status}`);
      }

      const data = await res.json();
      this.setState({ data, loading: false });
    } catch (err) {
      console.error("Failed to load hero analytics:", err);
      this.setState({
        error: err instanceof Error ? err.message : "Failed to load analytics",
        loading: false,
      });
    }
  };

  /**
   * Format percentage
   */
  private formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  /**
   * Format number with commas
   */
  private formatNumber = (value: number): string => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  /**
   * Format time in seconds to readable format
   */
  private formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  /**
   * Render stat card
   */
  private renderStatCard = (
    label: string,
    value: string | number,
    icon?: React.ReactNode,
    trend?: { change: number; trend: "up" | "down" | "stable" },
    subtitle?: string
  ): React.ReactNode => {
    const trendColor = trend?.trend === "up" ? "var(--brand-green-600)" : trend?.trend === "down" ? "var(--error-text)" : "var(--ink-500)";
    const trendSymbol = trend?.trend === "up" ? "↑" : trend?.trend === "down" ? "↓" : "→";

    return (
      <div className={`${this.baseClass}__statCard`}>
        <div className={`${this.baseClass}__statHeader`}>
          <div className={`${this.baseClass}__statLabel`}>
            {icon && <span className={`${this.baseClass}__statIcon`}>{icon}</span>}
            <span>{label}</span>
          </div>
          {trend && (
            <div className={`${this.baseClass}__statTrend`} style={{ color: trendColor }}>
              <span>{trendSymbol}</span>
              <span>{Math.abs(trend.change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`${this.baseClass}__statValue`}>{value}</div>
        {subtitle && <div className={`${this.baseClass}__statSubtitle`}>{subtitle}</div>}
      </div>
    );
  };

  /**
   * Render slides analytics table
   */
  private renderSlidesTable = (): React.ReactNode => {
    const { data } = this.state;
    if (!data || !data.slides || data.slides.length === 0) {
      return (
        <div className={`${this.baseClass}__empty`}>
          <p>Belum ada data slide analytics.</p>
        </div>
      );
    }

    return (
      <div className={`${this.baseClass}__tableWrapper`}>
        <table className={`${this.baseClass}__table`}>
          <thead>
            <tr>
              <th>Slide</th>
              <th>Views</th>
              <th>Clicks</th>
              <th>CTR</th>
              <th>Avg Time</th>
            </tr>
          </thead>
          <tbody>
            {data.slides.map((slide, index) => (
              <tr key={slide.slideId}>
                <td>
                  <div className={`${this.baseClass}__slideInfo`}>
                    <span className={`${this.baseClass}__slideIndex`}>#{index + 1}</span>
                    <span className={`${this.baseClass}__slideTitle`} title={slide.slideTitle}>
                      {slide.slideTitle || "Untitled Slide"}
                    </span>
                  </div>
                </td>
                <td className={`${this.baseClass}__tableValue`}>{this.formatNumber(slide.views)}</td>
                <td className={`${this.baseClass}__tableValue`}>{this.formatNumber(slide.clicks)}</td>
                <td className={`${this.baseClass}__tableValue`}>{this.formatPercent(slide.ctr)}</td>
                <td className={`${this.baseClass}__tableValue`}>{this.formatTime(slide.timeSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /**
   * Render period selector
   */
  private renderPeriodSelector = (): React.ReactNode => {
    const { selectedPeriod } = this.state;
    const periods: Array<{ value: "7d" | "30d" | "90d" | "all"; label: string }> = [
      { value: "7d", label: "7 Hari" },
      { value: "30d", label: "30 Hari" },
      { value: "90d", label: "90 Hari" },
      { value: "all", label: "Semua" },
    ];

    return (
      <div className={`${this.baseClass}__periodSelector`}>
        {periods.map((period) => (
          <button
            key={period.value}
            type="button"
            className={`${this.baseClass}__periodBtn ${selectedPeriod === period.value ? `${this.baseClass}__periodBtn--active` : ""}`}
            onClick={() => {
              this.setState({ selectedPeriod: period.value });
              if (this.props.onPeriodChange) {
                this.props.onPeriodChange(period.value);
              }
            }}
            aria-label={`Pilih periode ${period.label}`}
            aria-pressed={selectedPeriod === period.value}
          >
            {period.label}
          </button>
        ))}
      </div>
    );
  };

  /**
   * Render main content
   */
  render(): React.ReactNode {
    const { loading, error, data } = this.state;

    return (
      <section className={this.baseClass} aria-label="Hero Analytics">
        <SectionHeader
          title="Hero Slider Analytics"
          subtitle="Analytics data untuk hero slider di homepage"
          actions={this.renderPeriodSelector()}
          className={`${this.baseClass}__header`}
        />

        {loading && (
          <div className={`${this.baseClass}__loading`}>
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        )}

        {error && (
          <div className={`${this.baseClass}__error`}>
            <ErrorIcon width={24} height={24} />
            <p>{error}</p>
            <button
              type="button"
              className={`${this.baseClass}__retryBtn`}
              onClick={this.loadAnalytics}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Stats Grid */}
            <div className={`${this.baseClass}__statsGrid`}>
              {this.renderStatCard(
                "Total Views",
                this.formatNumber(data.totalViews),
                <EyeIcon width={20} height={20} />,
                data.trends?.views,
                `Dalam ${data.period.days} hari`
              )}
              {this.renderStatCard(
                "Total Clicks",
                this.formatNumber(data.totalClicks),
                <ChartIcon width={20} height={20} />,
                data.trends?.clicks
              )}
              {this.renderStatCard(
                "Click-Through Rate",
                this.formatPercent(data.clickThroughRate),
                <ChartIcon width={20} height={20} />,
                data.trends?.ctr
              )}
              {this.renderStatCard(
                "Avg Time Spent",
                this.formatTime(data.averageTimeSpent),
                <ChartIcon width={20} height={20} />
              )}
            </div>

            {/* Slides Analytics Table */}
            <div className={`${this.baseClass}__card`}>
              <h3 className={`${this.baseClass}__cardTitle`}>Analytics per Slide</h3>
              {this.renderSlidesTable()}
            </div>
          </>
        )}

        {!loading && !error && !data && (
          <EmptyState
            title="Belum ada data analytics"
            description="Data analytics akan muncul setelah hero slider digunakan"
            icon={<ChartIcon width={64} height={64} style={{ opacity: 0.3 }} />}
            className={`${this.baseClass}__empty`}
          />
        )}
      </section>
    );
  }
}

export default HeroAnalyticsSection;

