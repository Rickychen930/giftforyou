/**
 * Copy Button Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/common/CopyButton.css";

export interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  onCopy?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface CopyButtonState {
  copied: boolean;
  timeoutId: NodeJS.Timeout | null;
}

/**
 * Copy Button Component
 * Class-based component for copying text to clipboard
 */
class CopyButton extends Component<CopyButtonProps, CopyButtonState> {
  private baseClass: string = "copy-button";

  constructor(props: CopyButtonProps) {
    super(props);
    this.state = {
      copied: false,
      timeoutId: null,
    };
  }

  componentWillUnmount(): void {
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }
  }

  private getClasses(): string {
    const { size = "md", className = "" } = this.props;
    const { copied } = this.state;
    const copiedClass = copied ? `${this.baseClass}--copied` : "";
    return `${this.baseClass} ${this.baseClass}--${size} ${copiedClass} ${className}`.trim();
  }

  private setCopiedState = (): void => {
    const { onCopy } = this.props;
    const { timeoutId } = this.state;

    this.setState({ copied: true });
    onCopy?.();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      this.setState({ copied: false });
    }, 1800);

    this.setState({ timeoutId: newTimeoutId });
  };

  private handleCopy = async (): Promise<void> => {
    const { text } = this.props;
    const trimmed = String(text ?? "").trim();
    if (!trimmed) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(trimmed);
        this.setCopiedState();
        return;
      }
    } catch {
      // fall back below
    }

    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = trimmed;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const ok = document.execCommand("copy");
      if (ok) this.setCopiedState();
    } finally {
      document.body.removeChild(textarea);
    }
  };

  private renderIcon(): React.ReactNode {
    const { copied } = this.state;

    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        {copied ? (
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
    );
  }

  render(): React.ReactNode {
    const { label = "Salin", copiedLabel = "Tersalin" } = this.props;
    const { copied } = this.state;

    return (
      <button
        type="button"
        className={this.getClasses()}
        onClick={this.handleCopy}
        aria-label={copied ? copiedLabel : label}
        title={copied ? copiedLabel : label}
      >
        {this.renderIcon()}
        <span className={`${this.baseClass}__text`}>{copied ? copiedLabel : label}</span>
      </button>
    );
  }
}

export default CopyButton;
