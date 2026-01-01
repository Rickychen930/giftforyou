/**
 * Base Modal Component (Abstract)
 * OOP Base Class for all modal/dialog components
 * Follows SOLID principles
 */

import React, { Component, KeyboardEvent } from "react";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  ariaLabel?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children?: React.ReactNode;
}

export interface BaseModalState {
  isVisible: boolean;
  isExiting: boolean;
}

/**
 * Abstract Base Modal Class
 * All modal components should extend this class
 */
export abstract class BaseModal<P extends BaseModalProps = BaseModalProps, S extends BaseModalState = BaseModalState>
  extends Component<P, S> {
  
  protected baseClass: string = "baseModal";

  constructor(props: P) {
    super(props);
    this.state = {
      isVisible: false,
      isExiting: false,
    } as S;
  }

  componentDidMount(): void {
    if (this.props.isOpen) {
      this.handleOpen();
    }
  }

  componentDidUpdate(prevProps: P): void {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.handleOpen();
    } else if (!this.props.isOpen && prevProps.isOpen) {
      this.handleClose();
    }
  }

  componentWillUnmount(): void {
    // Cleanup
    if (this.props.isOpen) {
      document.body.style.overflow = "";
    }
  }

  /**
   * Handle modal open
   */
  protected handleOpen = (): void => {
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      this.setState({ isVisible: true });
    }, 10);
  };

  /**
   * Handle modal close
   */
  protected handleClose = (): void => {
    this.setState({ isExiting: true });
    setTimeout(() => {
      this.setState({ isVisible: false, isExiting: false });
      document.body.style.overflow = "";
      this.props.onClose();
    }, 300);
  };

  /**
   * Handle overlay click
   */
  protected handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (this.props.closeOnOverlayClick !== false && e.target === e.currentTarget) {
      this.handleClose();
    }
  };

  /**
   * Handle escape key
   */
  protected handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (this.props.closeOnEscape !== false && e.key === "Escape") {
      this.handleClose();
    }
  };

  /**
   * Get CSS classes for overlay
   */
  protected getOverlayClasses(): string {
    const { isVisible, isExiting } = this.state;
    return `${this.baseClass}__overlay ${isVisible ? `${this.baseClass}__overlay--visible` : ""} ${isExiting ? `${this.baseClass}__overlay--exiting` : ""}`.trim();
  }

  /**
   * Get CSS classes for content
   */
  protected getContentClasses(): string {
    const { className = "" } = this.props;
    const { isVisible, isExiting } = this.state;
    return `${this.baseClass}__content ${isVisible ? `${this.baseClass}__content--visible` : ""} ${isExiting ? `${this.baseClass}__content--exiting` : ""} ${className}`.trim();
  }

  /**
   * Render modal header (optional)
   * Override in child classes
   */
  protected renderHeader(): React.ReactNode {
    const { title } = this.props;
    if (!title) return null;

    return (
      <div className={`${this.baseClass}__header`}>
        <h2 className={`${this.baseClass}__title`} id={`${this.baseClass}-title`}>
          {title}
        </h2>
        <button
          type="button"
          className={`${this.baseClass}__close`}
          onClick={this.handleClose}
          aria-label="Tutup modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    );
  }

  /**
   * Render modal body
   * Override in child classes
   */
  protected renderBody(): React.ReactNode {
    return this.props.children;
  }

  /**
   * Render modal footer (optional)
   * Override in child classes
   */
  protected renderFooter(): React.ReactNode {
    return null;
  }

  /**
   * Abstract method - must be implemented by child classes
   */
  abstract render(): React.ReactNode;
}

