import { type Toast } from "../components/common/Toast";

// Global toast state management
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

const notifyListeners = (): void => {
  toastListeners.forEach((listener) => listener([...toasts]));
};

export const toast = {
  show: (message: string, type: Toast["type"] = "info", duration?: number): void => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };
    toasts = [...toasts, newToast];
    notifyListeners();

    // Auto remove
    const removeDuration = duration || 4000;
    setTimeout(() => {
      toast.remove(id);
    }, removeDuration);
  },

  success: (message: string, duration?: number): void => {
    toast.show(message, "success", duration);
  },

  error: (message: string, duration?: number): void => {
    toast.show(message, "error", duration);
  },

  warning: (message: string, duration?: number): void => {
    toast.show(message, "warning", duration);
  },

  info: (message: string, duration?: number): void => {
    toast.show(message, "info", duration);
  },

  remove: (id: string): void => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  },

  subscribe: (listener: (toasts: Toast[]) => void): (() => void) => {
    toastListeners.push(listener);
    listener([...toasts]);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  },
};

