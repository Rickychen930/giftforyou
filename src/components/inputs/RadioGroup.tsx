/**
 * Radio Group Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/RadioGroup.css";

export interface RadioOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface RadioGroupState {
  selectedValue: string;
}

/**
 * Radio Group Component
 * Class-based component for radio button groups
 */
class RadioGroup extends Component<RadioGroupProps, RadioGroupState> {
  private baseClass: string = "radioGroup";

  constructor(props: RadioGroupProps) {
    super(props);
    this.state = {
      selectedValue: props.value,
    };
  }

  componentDidUpdate(prevProps: RadioGroupProps): void {
    if (prevProps.value !== this.props.value) {
      this.setState({ selectedValue: this.props.value });
    }
  }

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private handleChange = (value: string): void => {
    this.setState({ selectedValue: value });
    this.props.onChange(value);
  };

  private renderOption(option: RadioOption): React.ReactNode {
    const { name } = this.props;
    const { selectedValue } = this.state;
    const isActive = selectedValue === option.value;

    return (
      <label
        key={option.value}
        className={`${this.baseClass}__option ${
          isActive ? `${this.baseClass}__option--active` : ""
        }`}
      >
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={isActive}
          onChange={(e) => this.handleChange(e.target.value)}
          className={`${this.baseClass}__input`}
        />
        <span className={`${this.baseClass}__content`}>
          {option.icon && <span className={`${this.baseClass}__icon`}>{option.icon}</span>}
          <span className={`${this.baseClass}__label`}>{option.label}</span>
          {option.description && (
            <span className={`${this.baseClass}__description`}>{option.description}</span>
          )}
        </span>
      </label>
    );
  }

  render(): React.ReactNode {
    const { options } = this.props;

    return (
      <div className={this.getClasses()} role="radiogroup">
        {options.map((option) => this.renderOption(option))}
      </div>
    );
  }
}

export default RadioGroup;

