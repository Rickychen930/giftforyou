/**
 * Form Field Component (OOP)
 * Wrapper component for form inputs following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/FormField.css";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

interface FormFieldState {
  hasError: boolean;
}

/**
 * Form Field Component
 * Class-based component for form field wrapper
 */
class FormField extends Component<FormFieldProps, FormFieldState> {
  private baseClass: string = "formField";

  constructor(props: FormFieldProps) {
    super(props);
    this.state = {
      hasError: !!props.error,
    };
  }

  componentDidUpdate(prevProps: FormFieldProps): void {
    if (prevProps.error !== this.props.error) {
      this.setState({ hasError: !!this.props.error });
    }
  }

  private getClasses(): string {
    const { className = "", error } = this.props;
    const errorClass = error ? `${this.baseClass}--error` : "";
    return `${this.baseClass} ${errorClass} ${className}`.trim();
  }

  private renderLabel(): React.ReactNode {
    const { label, required, htmlFor } = this.props;

    return (
      <label htmlFor={htmlFor} className={`${this.baseClass}__label`}>
        {label}
        {required && <span className={`${this.baseClass}__required`}>*</span>}
      </label>
    );
  }

  private renderHint(): React.ReactNode {
    const { hint, error } = this.props;
    if (!hint || error) return null;

    return <span className={`${this.baseClass}__hint`}>{hint}</span>;
  }

  private renderError(): React.ReactNode {
    const { error } = this.props;
    if (!error) return null;

    return (
      <span className={`${this.baseClass}__error`} role="alert">
        {error}
      </span>
    );
  }

  render(): React.ReactNode {
    const { children } = this.props;

    return (
      <div className={this.getClasses()}>
        {this.renderLabel()}
        {children}
        {this.renderHint()}
        {this.renderError()}
      </div>
    );
  }
}

export default FormField;

