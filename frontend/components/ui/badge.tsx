import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        neutral: "border-slate-200 bg-slate-50 text-slate-600",
        judicial: "border-judicial-100 bg-judicial-50 text-judicial-600",
        gold: "border-gold-300/50 bg-gold-100 text-gold-600",
        low: "border-emerald-200 bg-emerald-50 text-emerald-700",
        medium: "border-amber-200 bg-amber-50 text-amber-700",
        high: "border-rose-200 bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
