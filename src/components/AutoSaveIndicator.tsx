import React, { useEffect, useState } from "react";
import "../styles/AutoSaveIndicator.css";

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date | null;
  className?: string;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving,
  lastSaved,
  className = "",
}) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isSaving) {
      setShow(true);
      setMessage("Menyimpan...");
    } else if (lastSaved) {
      setShow(true);
      setMessage("Tersimpan");
      const timer = setTimeout(() => {
        setShow(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  if (!show) return null;

  return (
    <div className={`autoSaveIndicator ${isSaving ? "autoSaveIndicator--saving" : "autoSaveIndicator--saved"} ${className}`} role="status" aria-live="polite">
      <div className="autoSaveIndicator__content">
        {isSaving ? (
          <>
            <svg className="autoSaveIndicator__spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
            <span>{message}</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{message}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default AutoSaveIndicator;

