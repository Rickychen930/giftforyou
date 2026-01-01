/**
 * Luxury Toast Container Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import ToastComponent, { type Toast } from "./Toast";
import "../../styles/LuxuryToast.css";

interface LuxuryToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

interface LuxuryToastContainerState {
  // No state needed, but keeping for consistency
}

/**
 * Luxury Toast Container Component
 * Class-based component for toast notifications container
 */
class LuxuryToastContainer extends Component<LuxuryToastContainerProps, LuxuryToastContainerState> {
  private baseClass: string = "luxuryToastContainer";

  render(): React.ReactNode {
    const { toasts, onRemove } = this.props;

    return (
      <div className={this.baseClass} aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onClose={(id) => id && onRemove(id)} />
        ))}
      </div>
    );
  }
}

export default LuxuryToastContainer;

