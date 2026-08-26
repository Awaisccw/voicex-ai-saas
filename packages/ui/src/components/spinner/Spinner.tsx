import * as React from "react";
import clsx from "clsx";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerColor = "current" | "primary" | "secondary" | "muted" | "white";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  readonly size?: SpinnerSize;
  readonly color?: SpinnerColor;
  readonly label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

const colorClasses: Record<SpinnerColor, string> = {
  current: "text-current",
  primary: "text-primary",
  secondary: "text-secondary",
  muted: "text-muted-foreground",
  white: "text-white",
};

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size = "md", color = "current", label = "Loading...", className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={clsx("animate-spin", sizeClasses[size], colorClasses[color], className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label={label}
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  },
);

Spinner.displayName = "Spinner";
