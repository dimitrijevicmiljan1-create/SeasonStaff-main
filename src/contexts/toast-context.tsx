"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;
const TOAST_STACK_OFFSET_REM = 4.25;

function getToastTop(index: number): CSSProperties {
  return {
    top: `calc(3.5rem + env(safe-area-inset-top, 0px) + ${index * TOAST_STACK_OFFSET_REM}rem)`,
  };
}

function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={cn(
            "fixed left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm",
            toast.variant === "success" &&
              "border-status-approved/30 bg-status-approved-bg text-status-approved",
            toast.variant === "error" &&
              "border-status-rejected/30 bg-status-rejected-bg text-status-rejected",
          )}
          style={getToastTop(index)}
        >
          {toast.message}
        </div>
      ))}
    </>,
    document.body,
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `toast-${Date.now()}`;

      setToasts((current) => [...current, { id, message, variant }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      showSuccess: (message: string) => showToast(message, "success"),
      showError: (message: string) => showToast(message, "error"),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
