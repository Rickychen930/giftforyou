/**
 * Base Input Component (Abstract)
 * OOP Base Class for all input components
 * Follows SOLID principles
 */

import React, { Component, ChangeEvent } from "react";

export interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  error?: string;
  hint?: string;
  label?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}

export interface BaseInputState {
  isFocused: boolean;
  value: string;
}

/**
 * Abstract Base Input Class
 * All input components should extend this class
 */
export abstract class BaseInput<P extends BaseInputProps = BaseInputProps, S extends BaseInputState = BaseInputState>
  extends Component<P, S> {
  
  protected baseClass: string = "baseInput";

  constructor(props: P) {
    super(props);
    this.state = {
      isFocused: false,
      value: (props.value as string) || props.defaultValue as string || "",
    } as S;
  }

  /**
   * Get CSS classes for the input wrapper
   */
  protected getWrapperClasses(): string {
    const { error, className = "" } = this.props;
    const errorClass = error ? `${this.baseClass}__wrapper--error` : "";
    const focusedClass = this.state.isFocused ? `${this.baseClass}__wrapper--focused` : "";
    return `${this.baseClass}__wrapper ${errorClass} ${focusedClass} ${className}`.trim();
  }

  /**
   * Get CSS classes for the input
   */
  protected getInputClasses(): string {
    return `${this.baseClass}__input`;
  }

  /**
   * Handle focus events
   */
  protected handleFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    this.setState({ isFocused: true });
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  };

  protected handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    this.setState({ isFocused: false });
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  };

  /**
   * Handle change events
   */
  protected handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
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

  /**
   * Render label (optional)
   */
  protected renderLabel(): React.ReactNode {
    const { label, id } = this.props;
    if (!label) return null;
    
    return (
      <label htmlFor={id} className={`${this.baseClass}__label`}>
        {label}
      </label>
    );
  }

  /**
   * Render error message
   */
  protected renderError(): React.ReactNode {
    const { error, id } = this.props;
    if (!error) return null;
    
    return (
      <span id={`${id}-error`} className={`${this.baseClass}__error`} role="alert">
        {error}
      </span>
    );
  }

  /**
   * Render hint message
   */
  protected renderHint(): React.ReactNode {
    const { hint, id, error } = this.props;
    if (!hint || error) return null;
    
    return (
      <span id={`${id}-hint`} className={`${this.baseClass}__hint`}>
        {hint}
      </span>
    );
  }

  /**
   * Abstract method - must be implemented by child classes
   */
  abstract render(): React.ReactNode;
}

