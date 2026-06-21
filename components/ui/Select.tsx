"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children" | "size"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  variant?: "default" | "subtle";
  size?: "sm" | "md";
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      className,
      variant = "default",
      size = "md",
      placeholder = "Chọn một giá trị",
      value,
      defaultValue,
      onChange,
      disabled,
      id,
      name,
      required,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(() => {
      if (value !== undefined) return String(value);
      if (defaultValue !== undefined) return String(defaultValue);
      return "";
    });

    const controlledValue = value !== undefined ? String(value) : undefined;
    const currentValue = controlledValue ?? internalValue;

    const handleValueChange = (nextValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(nextValue);
      }

      const syntheticEvent = {
        target: {
          value: nextValue,
          name,
          id,
        },
        currentTarget: {
          value: nextValue,
          name,
          id,
        },
      } as React.ChangeEvent<HTMLSelectElement>;

      onChange?.(syntheticEvent);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <SelectPrimitive.Root
          value={currentValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectPrimitive.Trigger
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-red-500",
              size === "sm" && "h-8 px-2 text-xs",
              variant === "subtle" && "bg-slate-50 border-transparent hover:bg-slate-100",
              className
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder}>
              {options.find((opt) => opt.value === currentValue)?.label || placeholder}
            </SelectPrimitive.Value>
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-slate-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport
                className={cn(
                  "p-1",
                  "w-full min-w-[var(--radix-select-trigger-width)]"
                )}
              >
                {options.map((opt) => (
                  <SelectPrimitive.Item
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>

        <select
          ref={ref}
          id={id}
          name={name}
          value={currentValue}
          onChange={(e) => handleValueChange(e.target.value)}
          disabled={disabled}
          required={required}
          className="sr-only"
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
