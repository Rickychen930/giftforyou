import React, { useState, useEffect } from "react";
import "../../styles/common/CopyButton.css";

export interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  onCopy?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = "Salin",
  copiedLabel = "Tersalin",
  onCopy,
  className = "",
  size = "md",
}) => {
  const [copied, setCopied] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const handleCopy = async (): Promise<void> => {
    const trimmed = String(text ?? "").trim();
    if (!trimmed) return;

    const setCopiedState = () => {
      setCopied(true);
      onCopy?.();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = setTimeout(() => {
        setCopied(false);
      }, 1800);
      setTimeoutId(newTimeoutId);
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(trimmed);
        setCopiedState();
        return;
      }
    } catch {
      // fall back below
    }

    const textarea = document.createElement("textarea");
    textarea.value = trimmed;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const ok = document.execCommand("copy");
      if (ok) setCopiedState();
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <button
      type="button"
      className={`copy-button copy-button--${size} ${copied ? "copy-button--copied" : ""} ${className}`}
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        {copied ? (
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
      <span className="copy-button__text">{copied ? copiedLabel : label}</span>
    </button>
  );
};

export default CopyButton;

