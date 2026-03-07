"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-gradient-to-r from-bubblegum-400 to-bubblegum-500 text-white shadow-md shadow-bubblegum-300/40 hover:shadow-lg hover:shadow-bubblegum-300/60",
  secondary:
    "bg-grape-500 text-white shadow-md shadow-grape-300/40 hover:shadow-lg hover:shadow-grape-300/60",
  success:
    "bg-lime-500 text-white shadow-md shadow-lime-300/40 hover:shadow-lg hover:shadow-lime-300/60",
  ghost:
    "bg-transparent text-grape-600 hover:bg-grape-50",
} as const;

const sizes = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold",
          "transition-all duration-200 ease-out",
          "hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bubblegum-400 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
