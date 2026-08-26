import * as React from "react";
import clsx from "clsx";

export type LogoSize = "sm" | "md" | "lg";
export type LogoVariant = "full" | "icon";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly size?: LogoSize;
  readonly variant?: LogoVariant;
  readonly animated?: boolean;
}

const sizeConfig = {
  sm: { icon: "w-6 h-6", text: "text-base", subtext: "text-[9px]" },
  md: { icon: "w-8 h-8", text: "text-lg", subtext: "text-[10px]" },
  lg: { icon: "w-10 h-10", text: "text-2xl", subtext: "text-xs" },
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "full",
  animated = false,
  className,
  ...props
}) => {
  const currentSize = sizeConfig[size];

  return (
    <div
      className={clsx("inline-flex items-center gap-2.5 font-sans select-none", className)}
      {...props}
    >
      {/* Brand Icon SVG */}
      <div
        className={clsx(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-accent text-white shadow-glow p-1.5 shrink-0",
          currentSize.icon,
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Wave bars representing neural sound synthesis */}
          <rect
            x="4"
            y="12"
            width="3"
            height="8"
            rx="1.5"
            fill="currentColor"
            className={animated ? "animate-wave-pulse" : ""}
            style={{ animationDelay: "0ms" }}
          />
          <rect
            x="10"
            y="7"
            width="3"
            height="18"
            rx="1.5"
            fill="currentColor"
            className={animated ? "animate-wave-pulse" : ""}
            style={{ animationDelay: "150ms" }}
          />
          <rect
            x="16"
            y="3"
            width="3"
            height="26"
            rx="1.5"
            fill="currentColor"
            className={animated ? "animate-wave-pulse" : ""}
            style={{ animationDelay: "300ms" }}
          />
          <rect
            x="22"
            y="8"
            width="3"
            height="16"
            rx="1.5"
            fill="currentColor"
            className={animated ? "animate-wave-pulse" : ""}
            style={{ animationDelay: "450ms" }}
          />
          <rect
            x="28"
            y="13"
            width="3"
            height="6"
            rx="1.5"
            fill="currentColor"
            className={animated ? "animate-wave-pulse" : ""}
            style={{ animationDelay: "600ms" }}
          />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {variant === "full" && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={clsx(
                "font-bold tracking-tight text-foreground leading-none font-sans",
                currentSize.text,
              )}
            >
              VOICEX
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-wider">
              AI
            </span>
          </div>
          <span
            className={clsx(
              "font-medium uppercase tracking-widest text-muted-foreground leading-none mt-0.5",
              currentSize.subtext,
            )}
          >
            Neural Voice Engine
          </span>
        </div>
      )}
    </div>
  );
};

Logo.displayName = "Logo";
