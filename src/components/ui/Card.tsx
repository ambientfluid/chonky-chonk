import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const cardVariants = {
  default: "bg-white",
  game: "bg-white border-2 border-transparent bg-clip-padding relative before:absolute before:inset-0 before:-z-10 before:m-[-2px] before:rounded-[inherit] before:bg-gradient-to-br before:from-bubblegum-300 before:via-grape-300 before:to-lime-300",
} as const;

export type CardVariant = keyof typeof cardVariants;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 shadow-lg shadow-grape-100/50",
          cardVariants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
