"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      label,
      showValue = true,
      variant = "default",
      size = "md",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
      default: "bg-[var(--accent-3)]",
      success: "bg-green-500",
      warning: "bg-[var(--accent-2)]",
      danger: "bg-red-500",
    };

    const sizes = {
      sm: "h-1.5",
      md: "h-2",
      lg: "h-3",
    };

    return (
      <div ref={ref} className={cn("grid gap-1.5", className)} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center text-sm text-[var(--ink-soft)]">
            {label && <span>{label}</span>}
            {showValue && <span className="font-semibold">{Math.round(percentage)}%</span>}
          </div>
        )}
        <div
          className={cn(
            "bg-[rgba(28,30,36,0.08)] rounded-full overflow-hidden",
            sizes[size]
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
