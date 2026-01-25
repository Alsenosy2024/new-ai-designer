"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="grid gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-semibold text-sm text-[var(--ink)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/85 font-[inherit] text-[0.95rem]",
            "placeholder:text-[var(--ink-faint)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-[var(--ink-soft)]">{hint}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="grid gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-semibold text-sm text-[var(--ink)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/85 font-[inherit] text-[0.95rem] min-h-[120px] resize-y",
            "placeholder:text-[var(--ink-faint)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-[var(--ink-soft)]">{hint}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
