/**
 * Form Field Component
 * Luxury and responsive form field with label, input, and error message
 */

import React from "react";
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

/**
 * Form Field Component
 * Luxury styled form field wrapper
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  hint,
  children,
  htmlFor,
  className = "",
}) => {
  return (
    <div className={`formField ${className}`}>
      <label htmlFor={htmlFor} className="formField__label">
        {label}
        {required && <span className="formField__required">*</span>}
      </label>
      {children}
      {hint && !error && (
        <span className="formField__hint">{hint}</span>
      )}
      {error && (
        <span className="formField__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;

