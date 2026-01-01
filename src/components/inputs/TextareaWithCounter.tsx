/**
 * Textarea With Counter Component (OOP)
 * Standalone component following SOLID principles
 */

import React, { Component, ChangeEvent } from "react";
import "../../styles/TextareaWithCounter.css";

interface TextareaWithCounterProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  maxLength: number;
  currentLength: number;
  error?: string;
  hint?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
}

interface TextareaWithCounterState {
  isFocused: boolean;
  value: string;
}

/**
 * Textarea With Counter Component
 * Class-based component
 */
class TextareaWithCounter extends Component<TextareaWithCounterProps, TextareaWithCounterState> {
  protected baseClass: string = "textareaWithCounter";

  constructor(props: TextareaWithCounterProps) {
    super(props);
    this.state = {
      isFocused: false,
      value: (props.value as string) || props.defaultValue as string || "",
    };
  }

  protected getWrapperClasses(): string {
    const { error, className = "" } = this.props;
    const errorClass = error ? `${this.baseClass}--error` : "";
    const focusedClass = this.state.isFocused ? `${this.baseClass}--focused` : "";
    return `${this.baseClass} ${errorClass} ${focusedClass} ${className}`.trim();
  }

  protected handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    this.setState({ value });
    
    // Call standard React onChange
    if (this.props.onChange) {
      this.props.onChange(e);
    }
    
    // Call custom onValueChange if provided
    if (this.props.onValueChange) {
      this.props.onValueChange(value, e);
    }
  };

  protected handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>): void => {
    this.setState({ isFocused: true });
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  };

  protected handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>): void => {
    this.setState({ isFocused: false });
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  };

  protected renderHint(): React.ReactNode {
    const { hint, id, error } = this.props;
    if (!hint || error) return null;
    
    return (
      <span id={`${id}-hint`} className={`${this.baseClass}__hint`}>
        {hint}
      </span>
    );
  }

  protected renderError(): React.ReactNode {
    const { error, id } = this.props;
    if (!error) return null;
    
    return (
      <span id={`${id}-error`} className={`${this.baseClass}__error`} role="alert">
        {error}
      </span>
    );
  }

  protected renderCounter(): React.ReactNode {
    const { maxLength, currentLength } = this.props;
    const isNearLimit = currentLength >= maxLength * 0.9;
    const isAtLimit = currentLength >= maxLength;

    return (
      <span
        className={`${this.baseClass}__counter ${
          isAtLimit ? `${this.baseClass}__counter--limit` : ""
        } ${isNearLimit ? `${this.baseClass}__counter--near` : ""}`}
      >
        {currentLength} / {maxLength} karakter
      </span>
    );
  }

  protected renderFooter(): React.ReactNode {
    const { hint, error } = this.props;

    return (
      <div className={`${this.baseClass}__footer`}>
        {hint && !error && this.renderHint()}
        {this.renderCounter()}
      </div>
    );
  }

  render(): React.ReactNode {
    const { maxLength, currentLength, error, hint, id, onFocus, onBlur, ...textareaProps } = this.props;

    return (
      <div className={this.getWrapperClasses()}>
        <textarea
          className={`${this.baseClass}__textarea`}
          id={id}
          maxLength={maxLength}
          value={this.state.value}
          onChange={this.handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          {...textareaProps}
        />
        {this.renderFooter()}
        {this.renderError()}
      </div>
    );
  }
}

export default TextareaWithCounter;

