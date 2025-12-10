import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.3)] hover:shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.4)] hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_4px_20px_-4px_hsl(var(--destructive)/0.3)] hover:shadow-[0_8px_32px_-8px_hsl(var(--destructive)/0.4)] hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border-2 border-border bg-background hover:bg-secondary hover:border-primary/20 hover:text-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_4px_20px_-4px_hsl(var(--secondary)/0.3)] hover:shadow-[0_8px_32px_-8px_hsl(var(--secondary)/0.4)] hover:bg-secondary/80 active:scale-[0.98]",
        ghost: 
          "hover:bg-secondary hover:text-secondary-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        hero: 
          "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-[0_8px_24px_-6px_hsl(38_92%_50%/0.35)] hover:shadow-[0_20px_60px_-15px_hsl(38_92%_50%/0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        accent:
          "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 active:scale-[0.98]",
        glass:
          "backdrop-blur-xl bg-background/10 text-primary-foreground border border-primary-foreground/20 hover:bg-background/20 active:scale-[0.98]",
        premium:
          "bg-gradient-to-br from-slate-800 to-slate-900 text-primary-foreground shadow-[0_20px_60px_-15px_hsl(222_47%_11%/0.5)] hover:shadow-[0_8px_32px_-8px_hsl(222_47%_11%/0.6)] hover:opacity-90 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
