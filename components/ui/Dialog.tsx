"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

const DialogRoot = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500">
        <FiX className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  type?: "info" | "warning" | "success" | "danger";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "info",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isLoading = false,
}: DialogProps) {
  const icons = {
    info: <FiInfo className="w-6 h-6 text-primary-600" />,
    warning: <FiAlertTriangle className="w-6 h-6 text-yellow-600" />,
    success: <FiCheckCircle className="w-6 h-6 text-green-600" />,
    danger: <FiAlertTriangle className="w-6 h-6 text-red-600" />,
  };

  const bgColors = {
    info: "bg-primary-100",
    warning: "bg-yellow-100",
    success: "bg-green-100",
    danger: "bg-red-100",
  };

  const buttonVariant = {
    info: "primary" as const,
    warning: "primary" as const,
    success: "primary" as const,
    danger: "danger" as const,
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose(); }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
        >
          <div className="flex items-start gap-4">
            <div className={cn("flex-shrink-0 rounded-full p-2", bgColors[type])}>
              {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
              <DialogPrimitive.Title className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-sm text-gray-600">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            {onConfirm && (
              <Button
                variant={buttonVariant[type]}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : confirmText}
              </Button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}

export function useDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<DialogProps, "isOpen" | "onClose">>({
    title: "",
    onConfirm: undefined,
  });

  const showDialog = (dialogConfig: Omit<DialogProps, "isOpen" | "onClose">) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const DialogComponent = () => (
    <Dialog isOpen={isOpen} onClose={closeDialog} {...config} />
  );

  return { showDialog, closeDialog, DialogComponent };
}

export {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
