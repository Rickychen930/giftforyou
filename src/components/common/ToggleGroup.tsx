/**
 * Toggle Group Component
 * Reusable component for checkbox toggle groups
 * Follows OOP, SOLID, DRY principles
 * Fully responsive on all devices
 */

import React, { Component } from "react";
import "../../styles/common/ToggleGroup.css";

export interface ToggleOption {
  name: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

export interface ToggleGroupProps {
  options: ToggleOption[];
  onChange: (name: string, checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

interface ToggleGroupState {
  focusedIndex: number | null;
}

/**
 * Toggle Group Component
 * Class-based component following Single Responsibility Principle
 */
class ToggleGroup extends Component<ToggleGroupProps, ToggleGroupState> {
  constructor(props: ToggleGroupProps) {
    super(props);
    this.state = {
      focusedIndex: null,
    };
  }

  private handleChange = (name: string, checked: boolean): void => {
    if (!this.props.disabled) {
      this.props.onChange(name, checked);
    }
  };

  private handleFocus = (index: number): void => {
    this.setState({ focusedIndex: index });
  };

  private handleBlur = (): void => {
    this.setState({ focusedIndex: null });
  };

  private getClasses(): string {
    const { className = "", disabled } = this.props;
    const baseClass = "toggleGroup";
    const classes = [baseClass];

    if (disabled) classes.push(`${baseClass}--disabled`);
    if (className) classes.push(className);

    return classes.join(" ");
  }

  render(): React.ReactNode {
    const {
      options,
      label,
      disabled = false,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
    } = this.props;
    const { focusedIndex } = this.state;

    return (
      <div
        className={this.getClasses()}
        role="group"
        aria-label={ariaLabel || label || "Toggle options"}
        aria-describedby={ariaDescribedBy}
      >
        {label && (
          <span className="toggleGroup__label" aria-label={label}>
            {label}
          </span>
        )}
        <div className="toggleGroup__toggles">
          {options.map((option, index) => (
            <label
              key={option.name}
              className={`toggleGroup__toggle ${
                focusedIndex === index ? "toggleGroup__toggle--focused" : ""
              } ${option.disabled || disabled ? "toggleGroup__toggle--disabled" : ""}`}
            >
              <input
                type="checkbox"
                name={option.name}
                checked={option.checked}
                onChange={(e) => this.handleChange(option.name, e.target.checked)}
                disabled={option.disabled || disabled}
                onFocus={() => this.handleFocus(index)}
                onBlur={this.handleBlur}
                aria-label={option["aria-label"] || option.label}
                className="toggleGroup__input"
              />
              <span className="toggleGroup__labelText">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }
}

export default ToggleGroup;

