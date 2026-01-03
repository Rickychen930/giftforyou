/**
 * Status Select Component
 * Reusable component for selecting bouquet status (ready/preorder)
 * Follows OOP, SOLID, DRY principles
 * Fully responsive on all devices
 */

import React, { Component } from "react";
import "../../styles/inputs/StatusSelect.css";
import FormField from "./FormField";

export type StatusValue = "ready" | "preorder";

export interface StatusSelectProps {
  value: StatusValue;
  onChange: (value: StatusValue) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

interface StatusSelectState {
  isFocused: boolean;
}

/**
 * Status Select Component
 * Class-based component following Single Responsibility Principle
 */
class StatusSelect extends Component<StatusSelectProps, StatusSelectState> {
  private selectRef = React.createRef<HTMLSelectElement>();

  constructor(props: StatusSelectProps) {
    super(props);
    this.state = {
      isFocused: false,
    };
  }

  private handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as StatusValue;
    this.props.onChange(value);
  };

  private handleFocus = (): void => {
    this.setState({ isFocused: true });
  };

  private handleBlur = (): void => {
    this.setState({ isFocused: false });
  };

  private getClasses(): string {
    const { error, className = "", disabled } = this.props;
    const { isFocused } = this.state;
    const baseClass = "statusSelect";
    const classes = [baseClass];

    if (error) classes.push(`${baseClass}--error`);
    if (isFocused) classes.push(`${baseClass}--focused`);
    if (disabled) classes.push(`${baseClass}--disabled`);
    if (className) classes.push(className);

    return classes.join(" ");
  }

  render(): React.ReactNode {
    const {
      value,
      disabled = false,
      id = "status-select",
      name = "status",
      label,
      error,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
    } = this.props;

    const selectElement = (
      <select
        ref={this.selectRef}
        id={id}
        name={name}
        value={value}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        disabled={disabled}
        className={this.getClasses()}
        aria-label={ariaLabel || label || "Status bouquet"}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : ariaDescribedBy}
      >
        <option value="ready">Siap</option>
        <option value="preorder">Preorder</option>
      </select>
    );

    if (label) {
      return (
        <FormField
          label={label}
          htmlFor={id}
          error={error}
          className="statusSelect__field"
        >
          {selectElement}
        </FormField>
      );
    }

    return selectElement;
  }
}

export default StatusSelect;

