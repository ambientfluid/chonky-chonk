import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------
 * Input
 * ----------------------------------------------------------------------- */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full rounded-xl border-2 border-grape-200 bg-white px-4 py-2.5 text-sm text-grape-800",
          "placeholder:text-grape-300",
          "transition-all duration-200",
          "focus:border-bubblegum-400 focus:outline-none focus:ring-2 focus:ring-bubblegum-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

/* -------------------------------------------------------------------------
 * Textarea
 * ----------------------------------------------------------------------- */

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border-2 border-grape-200 bg-white px-4 py-2.5 text-sm text-grape-800",
          "placeholder:text-grape-300",
          "transition-all duration-200",
          "focus:border-bubblegum-400 focus:outline-none focus:ring-2 focus:ring-bubblegum-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "min-h-[100px] resize-y",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
