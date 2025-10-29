import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary/90 to-primary-glow/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105",
        secondary:
          "border-transparent bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary shadow-sm hover:shadow-md",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-md hover:shadow-lg",
        outline:
          "text-foreground border-primary/30 hover:bg-primary/10 hover:border-primary/50 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
