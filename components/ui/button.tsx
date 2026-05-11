"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-0 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ink: "bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-ink-2)]",
        paper:
          "bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] hover:bg-[var(--color-paper-2)]",
        stamp:
          "bg-[var(--color-stamp)] text-[var(--color-paper)] hover:brightness-110",
        ghost:
          "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]",
        link: "bg-transparent text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-stamp)]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
      shape: {
        square: "rounded-none",
        sharp: "rounded-[3px]",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "ink",
      size: "md",
      shape: "sharp",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
