"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Toast, ToastType } from "./Toast";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = Math.random().toString(36).substring(2, 11);
      const newToast: ToastMessage = { id, type, title, description };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, description?: string) => showToast("success", title, description),
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string) => showToast("error", title, description),
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string) => showToast("info", title, description),
    [showToast]
  );

  const warning = useCallback(
    (title: string, description?: string) => showToast("warning", title, description),
    [showToast]
  );

  const contextValue = useMemo(
    () => ({ showToast, success, error, info, warning }),
    [showToast, success, error, info, warning]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastPrimitive.Provider>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description}
            onClose={() => removeToast(toast.id)}
          />
        ))}
        <ToastPrimitive.Viewport className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full md:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
