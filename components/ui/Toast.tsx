"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiXCircle, FiX } from "react-icons/fi";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  type: ToastType;
  title: string;
  description?: string;
  onClose: () => void;
}

export function Toast({ type, title, description, onClose }: ToastProps) {
  const config = {
    success: {
      icon: <FiCheckCircle className="w-5 h-5" />,
      bgColor: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      descColor: "text-green-700",
    },
    error: {
      icon: <FiXCircle className="w-5 h-5" />,
      bgColor: "bg-red-50 border-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      descColor: "text-red-700",
    },
    warning: {
      icon: <FiAlertTriangle className="w-5 h-5" />,
      bgColor: "bg-yellow-50 border-yellow-200",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-900",
      descColor: "text-yellow-700",
    },
    info: {
      icon: <FiInfo className="w-5 h-5" />,
      bgColor: "bg-primary-50 border-primary-200",
      iconColor: "text-primary-600",
      titleColor: "text-primary-900",
      descColor: "text-primary-700",
    },
  };

  const { icon, bgColor, iconColor, titleColor, descColor } = config[type];

  return (
    <ToastPrimitive.Root
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      className={cn(
        "group pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
        bgColor
      )}
    >
      <div className="flex items-start gap-3 w-full">
        <div className={cn("flex-shrink-0 mt-0.5", iconColor)}>{icon}</div>
        <div className="grid gap-1 flex-1">
          <ToastPrimitive.Title className={cn("text-sm font-semibold", titleColor)}>
            {title}
          </ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className={cn("text-sm opacity-90", descColor)}>
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
      </div>
      <ToastPrimitive.Close
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100",
          iconColor
        )}
      >
        <FiX className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}
