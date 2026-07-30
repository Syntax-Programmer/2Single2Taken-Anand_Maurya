import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md border border-slate-200 bg-white px-3.5 text-sm text-slate-700",
          "placeholder:text-slate-400",
          "transition-colors duration-200 focus-visible:outline-none focus-visible:border-judicial-500 focus-visible:ring-2 focus-visible:ring-judicial-100",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
