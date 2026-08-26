import * as React from "react";
import clsx from "clsx";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive"
  | "glow";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant;
  readonly size?: BadgeSize;
  readonly dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground border-transparent",
  primary: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-secondary text-secondary-foreground border-border",
  outline: "bg-transparent text-foreground border-border",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  glow: "bg-primary/15 text-primary border-primary/30 shadow-glow",
};

const dotColorClasses: Record<BadgeVariant, string> = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  secondary: "bg-secondary-foreground",
  outline: "bg-foreground",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  glow: "bg-primary animate-ping",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-2xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium rounded-full border transition-colors select-none font-sans",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full shrink-0", dotColorClasses[variant])}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};

Badge.displayName = "Badge";
