/**
 * Text Input Component (OOP)
 * Reusable text input component following SOLID principles
 * Supports character counter, validation, and accessibility
 */

import React, { Component } from "react";
import "../../styles/inputs/TextInput.css";
import { getCharacterCountClass } from "../../models/bouquet-editor-model";

export interface TextInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  ariaInvalid?: "true" | "false";
  ariaDescribedBy?: string;
  className?: string;
  showCharacterCount?: boolean;
  autoComplete?: string;
  type?: "text" | "email" | "tel" | "url" | "search";
}

export interface TextInputState {
  currentLength: number;
}

/**
 * Text Input Component
 * Class-based component for text input fields
 * Handles character counting and validation display
 */
class TextInput extends Component<TextInputProps, TextInputState> {
  private baseClass: string = "textInput";

  constructor(props: TextInputProps) {
    super(props);
    this.state = {
      currentLength: props.value?.length || 0,
    };
  }

  componentDidUpdate(prevProps: TextInputProps): void {
    if (prevProps.value !== this.props.value) {
      this.setState({
        currentLength: this.props.value?.length || 0,
      });
    }
  }

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(e);
  };

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private renderCharacterCount(): React.ReactNode {
    const { maxLength, showCharacterCount } = this.props;
    const { currentLength } = this.state;

    if (!showCharacterCount || !maxLength) return null;

    const countClass = getCharacterCountClass(currentLength, maxLength);

    return (
      <span className={`${this.baseClass}__counter ${countClass}`}>
        {currentLength}/{maxLength}
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
      maxLength,
      minLength,
      ariaInvalid,
      ariaDescribedBy,
      autoComplete,
      type = "text",
    } = this.props;

    return (
      <div className={this.getClasses()}>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={this.handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          aria-required={required}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          autoComplete={autoComplete}
          className={`${this.baseClass}__input`}
        />
        {this.renderCharacterCount()}
      </div>
    );
  }
}

export default TextInput;

