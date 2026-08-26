import * as React from "react";
import clsx from "clsx";
import { Spinner } from "../spinner/Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border shadow-subtle active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-foreground hover:bg-muted/80 hover:text-foreground active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring",
  outline:
    "bg-transparent border border-border text-foreground hover:bg-muted/50 hover:border-muted-foreground/30 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg font-medium",
  lg: "h-12 px-6 text-base gap-2.5 rounded-lg font-medium",
};

const spinnerSizeMap: Record<ButtonSize, "xs" | "sm" | "md"> = {
  sm: "xs",
  md: "sm",
  lg: "md",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={clsx(
          "inline-flex items-center justify-center font-sans tracking-tight transition-all duration-200 outline-none select-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className,
        )}
        {...props}
      >
        {isLoading && (
          <Spinner
            size={spinnerSizeMap[size]}
            color={variant === "primary" ? "white" : "current"}
            className="shrink-0"
          />
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
