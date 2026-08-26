export interface ErrorContext {
  readonly userId?: string | undefined;
  readonly route?: string | undefined;
  readonly component?: string | undefined;
  readonly extra?: Record<string, unknown> | undefined;
}

export function captureException(error: unknown, context?: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

  // Log in development / fallback
  // eslint-disable-next-line no-console
  console.error("[Sentry] 🚨 Captured Exception:", {
    message: errorMessage,
    stack: errorStack,
    context,
  });

  if (!SENTRY_DSN) {
    return;
  }

  // Client-side Sentry SDK check
  if (typeof window !== "undefined") {
    const sentry = (window as unknown as { Sentry?: { captureException: (err: unknown, ctx?: unknown) => void } }).Sentry;
    if (sentry && typeof sentry.captureException === "function") {
      sentry.captureException(error, {
        user: context?.userId ? { id: context.userId } : undefined,
        tags: {
          route: context?.route,
          component: context?.component,
        },
        extra: context?.extra,
      });
    }
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  // eslint-disable-next-line no-console
  console.log(`[Sentry:${level.toUpperCase()}] 📢 ${message}`);
}
