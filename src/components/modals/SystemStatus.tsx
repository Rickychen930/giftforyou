/**
 * System Status Component (OOP)
 * Class-based component extending BaseModal
 */

import React, { Component } from "react";
import { BaseModal, BaseModalProps, BaseModalState } from "../base/BaseModal";
import "../../styles/SystemStatus.css";

interface SystemMetric {
  name: string;
  value: string | number;
  status: "healthy" | "warning" | "error";
  icon: string;
}

interface SystemStatusProps extends Omit<BaseModalProps, "title" | "children"> {
  // No additional props needed
}

interface SystemStatusState extends BaseModalState {
  metrics: SystemMetric[];
  isLoading: boolean;
  intervalId: NodeJS.Timeout | null;
}

/**
 * System Status Component
 * Class-based component extending BaseModal
 */
class SystemStatus extends BaseModal<SystemStatusProps, SystemStatusState> {
  protected baseClass: string = "systemStatus";

  constructor(props: SystemStatusProps) {
    super(props);
    this.state = {
      ...this.state,
      metrics: [],
      isLoading: true,
      intervalId: null,
    };
  }

  componentDidMount(): void {
    super.componentDidMount();
    if (this.props.isOpen) {
      this.loadSystemStatus();
      const intervalId = setInterval(this.loadSystemStatus, 30000); // Update every 30 seconds
      this.setState({ intervalId });
    }
  }

  componentDidUpdate(prevProps: SystemStatusProps): void {
    super.componentDidUpdate(prevProps);
    if (this.props.isOpen && !prevProps.isOpen) {
      this.loadSystemStatus();
      const intervalId = setInterval(this.loadSystemStatus, 30000);
      this.setState({ intervalId });
    } else if (!this.props.isOpen && prevProps.isOpen) {
      if (this.state.intervalId) {
        clearInterval(this.state.intervalId);
        this.setState({ intervalId: null });
      }
    }
  }

  componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }
  }

  private loadSystemStatus = async (): Promise<void> => {
    this.setState({ isLoading: true });
    // TODO: Fetch from API
    const mockMetrics: SystemMetric[] = [
      {
        name: "Database",
        value: "Connected",
        status: "healthy",
        icon: "🗄️",
      },
      {
        name: "API Server",
        value: "Running",
        status: "healthy",
        icon: "🚀",
      },
      {
        name: "Storage",
        value: "85% used",
        status: "warning",
        icon: "💾",
      },
      {
        name: "Memory",
        value: "2.1 GB / 4 GB",
        status: "healthy",
        icon: "🧠",
      },
    ];
    this.setState({ metrics: mockMetrics, isLoading: false });
  };

  private renderMetric(metric: SystemMetric, index: number): React.ReactNode {
    return (
      <div key={index} className={`${this.baseClass}__metric ${this.baseClass}__metric--${metric.status}`}>
        <div className={`${this.baseClass}__metricIcon`}>{metric.icon}</div>
        <div className={`${this.baseClass}__metricContent`}>
          <span className={`${this.baseClass}__metricName`}>{metric.name}</span>
          <span className={`${this.baseClass}__metricValue`}>{metric.value}</span>
        </div>
        <div className={`${this.baseClass}__metricStatus ${this.baseClass}__metricStatus--${metric.status}`}>
          {metric.status === "healthy" && "✓"}
          {metric.status === "warning" && "⚠"}
          {metric.status === "error" && "✗"}
        </div>
      </div>
    );
  }

  protected renderHeader(): React.ReactNode {
    return (
      <div className={`${this.baseClass}__header`}>
        <h3 className={`${this.baseClass}__title`}>System Status</h3>
        <button
          type="button"
          className={`${this.baseClass}__close`}
          onClick={this.handleClose}
          aria-label="Tutup System Status"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  protected renderBody(): React.ReactNode {
    const { metrics, isLoading } = this.state;

    if (isLoading) {
      return (
        <div className={`${this.baseClass}__loading`}>
          <svg
            className={`${this.baseClass}__spinner`}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
              opacity="0.3"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-15.708;-31.416;-31.416"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
          <span>Memuat status sistem...</span>
        </div>
      );
    }

    return (
      <div className={`${this.baseClass}__content`}>
        <div className={`${this.baseClass}__metrics`}>
          {metrics.map((metric, index) => this.renderMetric(metric, index))}
        </div>
      </div>
    );
  }

  protected renderFooter(): React.ReactNode {
    return null; // No footer needed
  }

  render(): React.ReactNode {
    const { isOpen } = this.props;
    const { isVisible } = this.state;

    if (!isOpen && !isVisible) return null;

    return (
      <>
        <div
          className="systemStatusOverlay"
          onClick={this.handleOverlayClick}
          aria-hidden="true"
        />
        <div className={this.baseClass}>
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </div>
      </>
    );
  }
}

export default SystemStatus;

