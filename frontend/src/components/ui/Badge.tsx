"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "warning" | "success" | "muted" | "danger";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center rounded-full font-semibold";

    const variants = {
      default: "bg-[rgba(29,75,143,0.14)] text-[var(--accent)]",
      warning: "bg-[rgba(201,121,44,0.18)] text-[var(--accent-2)]",
      success: "bg-[rgba(27,107,97,0.18)] text-[var(--accent-3)]",
      muted: "bg-[rgba(28,30,36,0.1)] text-[var(--ink-soft)]",
      danger: "bg-red-100 text-red-600",
    };

    const sizes = {
      sm: "px-2.5 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
