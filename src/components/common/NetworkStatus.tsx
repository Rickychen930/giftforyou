/**
 * Network Status Component (OOP)
 * Class-based component following SOLID principles
 * Shows network connectivity status to user
 */

import React, { Component } from "react";
import "../../styles/NetworkStatus.css";
import AlertMessage from "./AlertMessage";

interface NetworkStatusState {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Network Status Component
 * Monitors network connectivity and shows status to user
 */
class NetworkStatus extends Component<{}, NetworkStatusState> {
  private baseClass: string = "networkStatus";

  constructor(props: {}) {
    super(props);
    this.state = {
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      wasOffline: false,
    };
  }

  componentDidMount(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  componentWillUnmount(): void {
    if (typeof window === "undefined") return;

    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  private handleOnline = (): void => {
    this.setState({ isOnline: true, wasOffline: true });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.setState({ wasOffline: false });
    }, 3000);
  };

  private handleOffline = (): void => {
    this.setState({ isOnline: false, wasOffline: true });
  };

  render(): React.ReactNode {
    const { isOnline, wasOffline } = this.state;

    // Only show when offline or when coming back online
    if (!wasOffline) return null;

    return (
      <div
        className={`${this.baseClass} ${this.baseClass}--${isOnline ? "online" : "offline"}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <AlertMessage
          variant={isOnline ? "success" : "warning"}
          message={
            isOnline
              ? "Koneksi internet telah kembali. Halaman akan dimuat ulang."
              : "Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia."
          }
          className={`${this.baseClass}__message`}
        />
      </div>
    );
  }
}

export default NetworkStatus;

