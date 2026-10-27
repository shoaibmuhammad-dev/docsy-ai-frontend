// Client Component (interactive button with event handlers and loading states)
"use client";

import React from "react";
import { Spinner } from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantClasses = {
      primary:
        "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border border-transparent active:bg-indigo-800",
      secondary:
        "bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 shadow-xs active:bg-zinc-100",
      ghost:
        "bg-transparent hover:bg-zinc-100 text-zinc-700 active:bg-zinc-200 border border-transparent",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-xs border border-transparent active:bg-red-800",
    };

    const sizeClasses = {
      sm: "text-xs px-2.5 py-1.5 rounded-lg gap-1.5 min-h-[32px]",
      md: "text-sm px-3.5 py-2 rounded-xl gap-2 min-h-[38px]",
      lg: "text-sm px-5 py-2.5 rounded-xl gap-2.5 min-h-[44px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Spinner
            size={size === "sm" ? "sm" : "md"}
            className="text-current"
          />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
