"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cn } from "@/lib/utils";

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, disabled = false }: ToggleProps) {
  return (
    <label className={cn("flex items-center space-x-2 select-none", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer group")}>
      <TogglePrimitive.Root
        pressed={checked}
        onPressedChange={onChange}
        disabled={disabled}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed",
          checked ? "bg-primary-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </TogglePrimitive.Root>
      <span className={cn("text-sm font-medium transition-colors", disabled ? "text-slate-400" : "text-slate-700 group-hover:text-slate-900")}>
        {label}
      </span>
    </label>
  );
}
