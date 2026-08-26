import * as React from "react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
  readonly startAdornment?: React.ReactNode;
  readonly endAdornment?: React.ReactNode;
  readonly fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      startAdornment,
      endAdornment,
      fullWidth = false,
      disabled,
      required,
      id,
      className,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? (label ? `input-${generatedId}` : undefined);
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={clsx("flex flex-col gap-1.5 font-sans", fullWidth ? "w-full" : "w-auto")}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              "text-xs font-medium tracking-tight select-none transition-colors",
              error ? "text-destructive" : "text-foreground",
              disabled && "opacity-50",
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {startAdornment && (
            <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
              {startAdornment}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={clsx(errorId, helperId) || undefined}
            className={clsx(
              "h-10 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-150 outline-none",
              "focus:ring-2 focus:ring-offset-1 focus:ring-offset-background",
              error
                ? "border-destructive text-destructive focus:border-destructive focus:ring-destructive/30"
                : "border-border hover:border-border/80 focus:border-primary focus:ring-primary/20",
              startAdornment ? "pl-9" : "pl-3.5",
              endAdornment ? "pr-9" : "pr-3.5",
              disabled && "opacity-50 cursor-not-allowed bg-muted/40",
              className,
            )}
            {...props}
          />

          {endAdornment && (
            <div className="absolute right-3 flex items-center pointer-events-none text-muted-foreground">
              {endAdornment}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs text-destructive flex items-center gap-1 font-medium">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
