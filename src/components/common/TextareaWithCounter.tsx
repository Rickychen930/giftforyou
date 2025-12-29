/**
 * Textarea With Counter Component
 * Luxury and responsive textarea with character counter
 */

import React from "react";
import "../../styles/TextareaWithCounter.css";

interface TextareaWithCounterProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength: number;
  currentLength: number;
  error?: string;
  hint?: string;
  className?: string;
}

/**
 * Textarea With Counter Component
 * Luxury styled textarea with character counter
 */
const TextareaWithCounter: React.FC<TextareaWithCounterProps> = ({
  maxLength,
  currentLength,
  error,
  hint,
  className = "",
  id,
  ...props
}) => {
  const isNearLimit = currentLength >= maxLength * 0.9;
  const isAtLimit = currentLength >= maxLength;

  return (
    <div className="textareaWithCounter">
      <textarea
        className={`textareaWithCounter__textarea ${error ? "textareaWithCounter__textarea--error" : ""} ${className}`}
        id={id}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      <div className="textareaWithCounter__footer">
        {hint && !error && (
          <span className="textareaWithCounter__hint" id={hint ? `${id}-hint` : undefined}>
            {hint}
          </span>
        )}
        <span
          className={`textareaWithCounter__counter ${
            isAtLimit ? "textareaWithCounter__counter--limit" : ""
          } ${isNearLimit ? "textareaWithCounter__counter--near" : ""}`}
        >
          {currentLength} / {maxLength} karakter
        </span>
      </div>
      {error && (
        <span className="textareaWithCounter__error" id={id ? `${id}-error` : undefined} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default TextareaWithCounter;

