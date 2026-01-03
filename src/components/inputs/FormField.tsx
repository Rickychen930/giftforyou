/**
 * Form Field Component (OOP)
 * Wrapper component for form inputs following SOLID principles
 * Ensures htmlFor matches input id for proper accessibility
 */

import React, { Component, ReactElement } from "react";
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
  inputId: string | undefined;
}

/**
 * Form Field Component
 * Class-based component for form field wrapper
 * Automatically ensures label htmlFor matches input id
 */
class FormField extends Component<FormFieldProps, FormFieldState> {
  private baseClass: string = "formField";

  constructor(props: FormFieldProps) {
    super(props);
    this.state = {
      hasError: !!props.error,
      inputId: this.extractInputId(props),
    };
  }

  componentDidUpdate(prevProps: FormFieldProps): void {
    if (prevProps.error !== this.props.error) {
      this.setState({ hasError: !!this.props.error });
    }
    
    const newInputId = this.extractInputId(this.props);
    if (newInputId !== this.state.inputId) {
      this.setState({ inputId: newInputId });
    }
  }

  /**
   * Extract input id from children
   * Checks if child is a native input/textarea/select element
   */
  private extractInputId(props: FormFieldProps): string | undefined {
    const { htmlFor, children } = props;
    
    // If htmlFor is provided, use it
    if (htmlFor) {
      return htmlFor;
    }

    // Try to extract id from children
    if (React.isValidElement(children)) {
      const child = children as ReactElement;
      
      // If child has id prop, use it
      if (child.props?.id) {
        return child.props.id;
      }
      
      // If child has name prop, generate id from it
      if (child.props?.name) {
        return child.props.name.replace(/\s+/g, '-').toLowerCase();
      }
    }

    // If children is an array, check first element
    if (Array.isArray(children)) {
      const firstChild = children[0];
      if (React.isValidElement(firstChild)) {
        const child = firstChild as ReactElement;
        if (child.props?.id) {
          return child.props.id;
        }
        if (child.props?.name) {
          return child.props.name.replace(/\s+/g, '-').toLowerCase();
        }
      }
    }

    return undefined;
  }

  private getClasses(): string {
    const { className = "", error } = this.props;
    const errorClass = error ? `${this.baseClass}--error` : "";
    return `${this.baseClass} ${errorClass} ${className}`.trim();
  }

  private renderLabel(): React.ReactNode {
    const { label, required } = this.props;
    const { inputId } = this.state;

    // Only use htmlFor if we have a valid inputId
    // For custom components (like DropdownWithModal, TagInput), we don't use htmlFor
    const labelProps = inputId ? { htmlFor: inputId } : {};

    return (
      <label {...labelProps} className={`${this.baseClass}__label`}>
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

