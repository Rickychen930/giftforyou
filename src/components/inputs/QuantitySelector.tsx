/**
 * Quantity Selector Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/QuantitySelector.css";

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface QuantitySelectorState {
  currentValue: number;
}

/**
 * Quantity Selector Component
 * Class-based component for quantity selection
 */
class QuantitySelector extends Component<QuantitySelectorProps, QuantitySelectorState> {
  private baseClass: string = "quantitySelector";

  constructor(props: QuantitySelectorProps) {
    super(props);
    this.state = {
      currentValue: props.value,
    };
  }

  componentDidUpdate(prevProps: QuantitySelectorProps): void {
    if (prevProps.value !== this.props.value) {
      this.setState({ currentValue: this.props.value });
    }
  }

  private getClasses(): string {
    const { size = "md", className = "" } = this.props;
    return `${this.baseClass} ${this.baseClass}--${size} ${className}`.trim();
  }

  private handleDecrement = (): void => {
    const { min = 1, onChange, disabled } = this.props;
    const { currentValue } = this.state;

    if (disabled || currentValue <= min) return;

    const newValue = currentValue - 1;
    this.setState({ currentValue: newValue });
    onChange(newValue);
  };

  private handleIncrement = (): void => {
    const { max = 999, onChange, disabled } = this.props;
    const { currentValue } = this.state;

    if (disabled || currentValue >= max) return;

    const newValue = currentValue + 1;
    this.setState({ currentValue: newValue });
    onChange(newValue);
  };

  private renderDecrementButton(): React.ReactNode {
    const { disabled, min = 1 } = this.props;
    const { currentValue } = this.state;

    return (
      <button
        type="button"
        className={`${this.baseClass}__button ${this.baseClass}__button--decrement`}
        onClick={this.handleDecrement}
        disabled={disabled || currentValue <= min}
        aria-label="Kurangi jumlah"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  private renderIncrementButton(): React.ReactNode {
    const { disabled, max = 999 } = this.props;
    const { currentValue } = this.state;

    return (
      <button
        type="button"
        className={`${this.baseClass}__button ${this.baseClass}__button--increment`}
        onClick={this.handleIncrement}
        disabled={disabled || currentValue >= max}
        aria-label="Tambah jumlah"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  render(): React.ReactNode {
    const { currentValue } = this.state;

    return (
      <div className={this.getClasses()}>
        {this.renderDecrementButton()}
        <span className={`${this.baseClass}__value`}>{currentValue}</span>
        {this.renderIncrementButton()}
      </div>
    );
  }
}

export default QuantitySelector;

