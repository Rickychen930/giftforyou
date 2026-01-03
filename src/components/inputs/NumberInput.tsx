/**
 * Number Input Component (OOP)
 * Reusable number input component following SOLID principles
 * Optimized for performance with proper validation
 */

import React, { Component } from "react";
import "../../styles/inputs/TextInput.css";

export interface NumberInputProps {
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  ariaInvalid?: "true" | "false";
  ariaDescribedBy?: string;
  className?: string;
  autoComplete?: string;
}

/**
 * Number Input Component
 * Class-based component for number input fields
 * Optimized for performance with minimal re-renders
 */
class NumberInput extends Component<NumberInputProps> {
  private baseClass: string = "textInput";

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(e);
  };

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
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
      step = 1,
      ariaInvalid,
      ariaDescribedBy,
      autoComplete,
    } = this.props;

    // Convert number to string for input value
    const stringValue = typeof value === "number" ? (value > 0 ? String(value) : "") : value;

    return (
      <div className={this.getClasses()}>
        <input
          id={id}
          name={name}
          type="number"
          value={stringValue}
          onChange={this.handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          aria-required={required}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          autoComplete={autoComplete}
          className={`${this.baseClass}__input`}
          inputMode="numeric"
        />
      </div>
    );
  }
}

export default NumberInput;

