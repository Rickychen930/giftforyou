import React, { useState } from "react";
import LuxuryToast, { type Toast } from "./LuxuryToast";
import "../styles/LuxuryToast.css";

interface LuxuryToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const LuxuryToastContainer: React.FC<LuxuryToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="luxuryToastContainer" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <LuxuryToast key={toast.id} toast={toast} onClose={onRemove} />
      ))}
    </div>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast["type"] = "info", duration?: number): void => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };
    setToasts((prev: Toast[]) => [...prev, newToast]);
  };

  const removeToast = (id: string): void => {
    setToasts((prev: Toast[]) => prev.filter((t: Toast) => t.id !== id));
  };

  const ToastContainer = (): React.ReactElement => (
    <LuxuryToastContainer toasts={toasts} onRemove={removeToast} />
  );

  return {
    showToast,
    ToastContainer,
  };
};

export default LuxuryToastContainer;

