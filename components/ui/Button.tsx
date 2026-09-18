"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
          variant === "primary" &&
            "px-6 py-3 text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:brightness-110 focus-visible:ring-cyan-400",
          variant === "secondary" &&
            "px-6 py-3 text-slate-700 dark:text-slate-100 bg-white/60 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-white/10 focus-visible:ring-slate-400",
          variant === "icon" &&
            "h-11 w-11 text-slate-700 dark:text-slate-100 bg-white/60 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-white/10 focus-visible:ring-slate-400",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
