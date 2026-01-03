/**
 * Price Input Component (OOP)
 * Reusable price/number input component following SOLID principles
 * Supports price preview formatting and validation
 */

import React, { Component } from "react";
import "../../styles/inputs/PriceInput.css";
import { formatPricePreview } from "../../models/bouquet-editor-model";

export interface PriceInputProps {
  id: string;
  name: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string | number;
  ariaInvalid?: "true" | "false";
  ariaDescribedBy?: string;
  className?: string;
  showPreview?: boolean;
  autoComplete?: string;
}

export interface PriceInputState {
  numericValue: number;
}

/**
 * Price Input Component
 * Class-based component for price/number input fields
 * Handles price preview formatting
 */
class PriceInput extends Component<PriceInputProps, PriceInputState> {
  private baseClass: string = "priceInput";

  constructor(props: PriceInputProps) {
    super(props);
    this.state = {
      numericValue: this.parseNumericValue(props.value),
    };
  }

  componentDidUpdate(prevProps: PriceInputProps): void {
    if (prevProps.value !== this.props.value) {
      this.setState({
        numericValue: this.parseNumericValue(this.props.value),
      });
    }
  }

  /**
   * Parse numeric value from prop
   * Handles string and number inputs
   */
  private parseNumericValue(value: number | string): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(e);
  };

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private renderPreview(): React.ReactNode {
    const { showPreview = true } = this.props;
    const { numericValue } = this.state;

    if (!showPreview || numericValue <= 0) return null;

    const formattedPrice = formatPricePreview(numericValue);

    return (
      <span className={`${this.baseClass}__preview`}>
        {formattedPrice}
      </span>
    );
  }

  render(): React.ReactNode {
    const {
      id,
      name,
      value,
      placeholder,
      disabled,
      required,
      min,
      max,
      step,
      ariaInvalid,
      ariaDescribedBy,
      autoComplete,
    } = this.props;

    return (
      <div className={this.getClasses()}>
        <div className={`${this.baseClass}__wrapper`}>
          <input
            id={id}
            name={name}
            type="number"
            value={value || ""}
            onChange={this.handleChange}
            placeholder={placeholder || "0"}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            step={step || "any"}
            aria-required={required}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            autoComplete={autoComplete}
            className={`${this.baseClass}__input`}
          />
        </div>
        {this.renderPreview()}
      </div>
    );
  }
}

export default PriceInput;

