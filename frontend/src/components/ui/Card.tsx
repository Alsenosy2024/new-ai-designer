"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const baseStyles = "rounded-[var(--radius-lg)] border";

    const variants = {
      default:
        "bg-[var(--surface)] border-[var(--line)] shadow-[var(--shadow-sm)]",
      elevated:
        "bg-[var(--surface)] border-[var(--line)] shadow-[var(--shadow-lg)]",
      outlined: "bg-transparent border-[var(--line)]",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-[18px]",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-3 mb-3 pb-3 border-b border-[var(--line)]",
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-bold text-base m-0", className)} {...props} />
  )
);

CardTitle.displayName = "CardTitle";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
