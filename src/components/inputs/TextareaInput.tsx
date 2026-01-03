/**
 * Textarea Input Component (OOP)
 * Reusable textarea component following SOLID principles
 * Supports character counter, validation, and accessibility
 */

import React, { Component } from "react";
import "../../styles/inputs/TextareaInput.css";
import { getCharacterCountClass } from "../../models/bouquet-editor-model";

export interface TextareaInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  ariaInvalid?: "true" | "false";
  ariaDescribedBy?: string;
  className?: string;
  showCharacterCount?: boolean;
  autoComplete?: string;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

export interface TextareaInputState {
  currentLength: number;
}

/**
 * Textarea Input Component
 * Class-based component for textarea fields
 * Handles character counting and validation display
 */
class TextareaInput extends Component<TextareaInputProps, TextareaInputState> {
  private baseClass: string = "textareaInput";

  constructor(props: TextareaInputProps) {
    super(props);
    this.state = {
      currentLength: props.value?.length || 0,
    };
  }

  componentDidUpdate(prevProps: TextareaInputProps): void {
    if (prevProps.value !== this.props.value) {
      this.setState({
        currentLength: this.props.value?.length || 0,
      });
    }
  }

  private handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
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
        {currentLength}/{maxLength} karakter
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
      rows = 4,
      ariaInvalid,
      ariaDescribedBy,
      autoComplete,
      resize = "vertical",
    } = this.props;

    const textareaStyle: React.CSSProperties = {
      resize,
    };

    return (
      <div className={this.getClasses()}>
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={this.handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          aria-required={required}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          autoComplete={autoComplete}
          className={`${this.baseClass}__textarea`}
          style={textareaStyle}
        />
        {this.renderCharacterCount()}
      </div>
    );
  }
}

export default TextareaInput;

