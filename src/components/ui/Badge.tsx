import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const badgeVariants = {
  pink: "bg-bubblegum-100 text-bubblegum-600",
  purple: "bg-grape-100 text-grape-600",
  green: "bg-lime-100 text-lime-700",
  blue: "bg-blue-100 text-blue-600",
  gray: "bg-gray-100 text-gray-600",
} as const;

export type BadgeVariant = keyof typeof badgeVariants;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "pink", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          "transition-colors",
          badgeVariants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
